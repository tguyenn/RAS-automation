/*
 * Venmo email listener (Apps Script)
 *
 * - Searches Gmail for Venmo-related emails
 * - Parses amount, payer, timestamp and a transaction id (or generates a hash)
 * - Appends a row to a VenmoTransactions sheet inside the master budget spreadsheet
 * - Ensures idempotency by skipping already processed tx_ids
 * - Labels threads as processed or error
 */

// Public entry point: run on a time-driven trigger (e.g., every 5-15 minutes)
function processVenmoEmails() {
  Logger.log('processVenmoEmails: start');

  // Load properties defined in `main.js` (PropertiesService)
  if (typeof properties === 'undefined') {
    properties = PropertiesService.getScriptProperties().getProperties();
  }

  const budgetSheetId = properties['BUDGET_SHEET_ID'];
  if (!budgetSheetId) {
    Logger.log('processVenmoEmails: BUDGET_SHEET_ID not set in Properties');
    return;
  }
  // Prepare spreadsheet and labels up-front so the VenmoTransactions sheet
  // will be created even if there are no matching Venmo emails yet.
  const processedLabel = getOrCreateLabel('Venmo-Processed');
  const errorLabel = getOrCreateLabel('Venmo-Error');

  const ss = SpreadsheetApp.openById(budgetSheetId);
  let txSheet = ss.getSheetByName('VenmoTransactions');
  if (!txSheet) {
    txSheet = createVenmoTransactionsSheet_(ss);
    Logger.log('processVenmoEmails: created VenmoTransactions sheet');
  }

  // Build a search query. Allow overriding via Script Property VENMO_SEARCH_QUERY.
  // Default looks for venmo.com links or common "You received" subject lines.
  const searchQuery = buildVenmoSearchQuery(properties);
  const threads = GmailApp.search(searchQuery);
  if (!threads || threads.length === 0) {
    Logger.log('processVenmoEmails: no Venmo threads found');
    return; // sheet is created above, so we're done for now
  }

  threads.forEach(thread => {
    try {
      const messages = thread.getMessages();
      messages.forEach(message => {
        // Only process unread messages by default. If VENMO_FORCE_RESCAN=true,
        // also process read messages (useful for initial catch-up).
        const forceRescan = (properties['VENMO_FORCE_RESCAN'] || 'false').toLowerCase() === 'true';
        if (message.isUnread() || forceRescan) {
          if (!message.isUnread() && forceRescan) Logger.log('processVenmoEmails: processing read message due to VENMO_FORCE_RESCAN');
          const subject = message.getSubject() || '';
          const body = message.getPlainBody() || '';
          const msgDate = message.getDate();

          const parsed = parseVenmoEmail(subject, body, msgDate);

          if (!parsed || parsed.amount == null) {
            Logger.log('processVenmoEmails: could not parse amount, labeling for manual review');
            thread.addLabel(errorLabel);
            thread.markRead();
            return;
          }

          // Build tx_id (prefer extracted, otherwise computed hash)
          let txId = parsed.txid;
          if (!txId) {
            txId = computeMessageHash_(message, parsed.amount, parsed.currency);
          }

          // Idempotency check
          if (isTxProcessed_(txSheet, txId)) {
            Logger.log('processVenmoEmails: tx already processed: ' + txId);
            thread.addLabel(processedLabel);
            thread.markRead();
            return; // skip
          }

          // Append transaction row
          const processedAt = new Date();
          const snippet = message.getSnippet ? message.getSnippet() : body.substring(0, 200);
          const row = [
            txId,
            parsed.received_at ? parsed.received_at.toISOString() : msgDate.toISOString(),
            parsed.amount,
            parsed.currency || 'USD',
            parsed.payer || '',
            subject,
            snippet,
            processedAt.toISOString(),
            'processed',
            '' // notes
          ];

          txSheet.appendRow(row);

          // Update a cached balance cell formula (K1/K2) so sheet shows current sum
          ensureBalanceFormula_(txSheet);

          // Propagate updated balance to master sheet/cell if configured
          try {
            updateMasterBalance_(ss, txSheet);
          } catch (e) {
            Logger.log('processVenmoEmails: failed to update master balance: ' + e.message);
          }

          // Mark thread processed
          thread.addLabel(processedLabel);
          thread.markRead();
          Logger.log('processVenmoEmails: appended tx ' + txId + ' amount ' + parsed.amount);
        }
      });
    } catch (e) {
      Logger.log('processVenmoEmails: error processing thread: ' + e.message);
      thread.addLabel(errorLabel);
    }
  });

  Logger.log('processVenmoEmails: done');
}


// Build a Gmail search query for Venmo-like messages.
// If Script Property `VENMO_SEARCH_QUERY` is set, it will be used verbatim.
// Otherwise a safe default is returned which looks for venmo.com links, typical
// subject phrases, or common Venmo sender addresses within the last 30 days.
function buildVenmoSearchQuery(properties) {
  const override = properties['VENMO_SEARCH_QUERY'];
  if (override && override.trim() !== '') return override;

  // default: looks for venmo.com links OR "You received" subject OR common venmo senders
  const days = properties['VENMO_SEARCH_DAYS'] || '30';
  const parts = [
    '("https://venmo.com" OR "venmo.com")',
    'subject:("you received" OR "you got" OR "you received a payment" )',
    'from:(@venmo.com OR venmo@venmo.com OR noreply@venmo.com)'
  ];
  return `${parts.join(' OR ')} newer_than:${days}d`;
}


// Parse common Venmo email shapes to extract amount, payer, txid, and date
function parseVenmoEmail(subject, body, msgDate) {
  const lowerSubj = subject.toLowerCase();
  const lowerBody = body.toLowerCase();

  // 1) Try to extract amount ($X.YY)
  const amountMatch = body.match(/\$([0-9,]+(?:\.[0-9]{2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

  // 2) Try to extract payer from subject like "You received $15.00 from John Doe"
  let payer = null;
  const subjFromMatch = subject.match(/you (?:received|received a payment|got) .* from (.+)/i);
  if (subjFromMatch) {
    payer = subjFromMatch[1].trim();
  } else {
    // try body patterns
    const fromMatch = body.match(/from\s+([A-Za-z0-9 \-_.@]+)/i);
    if (fromMatch) payer = fromMatch[1].trim().split('\n')[0];
  }

  // 3) Try to extract a transaction URL or id
  let txid = null;
  const urlMatch = body.match(/https?:\/\/venmo\.com\/[A-Za-z0-9\-_/]+/i);
  if (urlMatch) {
    txid = urlMatch[0];
  } else {
    const idMatch = body.match(/transaction [iI]d[:\s]*([A-Za-z0-9\-]+)/i);
    if (idMatch) txid = idMatch[1];
  }

  return {
    amount: amount,
    currency: amount ? 'USD' : null,
    payer: payer,
    txid: txid,
    received_at: msgDate
  };
}


// Create the VenmoTransactions sheet with header row and return it
function createVenmoTransactionsSheet_(ss) {
  const sheet = ss.insertSheet('VenmoTransactions');
  const headers = ['tx_id', 'received_at', 'amount', 'currency', 'payer_name', 'email_subject', 'email_snippet', 'processed_at', 'status', 'notes'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  // Set amount column number format
  sheet.getRange('C:C').setNumberFormat('$#,##0.00');
  // Place a simple balance label and formula to K1/K2 (adjust if sheet layout changes)
  sheet.getRange('K1').setValue('Current Balance');
  sheet.getRange('K2').setFormula('=SUM(C2:C)');
  return sheet;
}


// Ensure the balance formula exists in K2
function ensureBalanceFormula_(sheet) {
  const formulaCell = sheet.getRange('K2');
  const formula = formulaCell.getFormula();
  if (!formula || formula === '') {
    formulaCell.setFormula('=SUM(C2:C)');
  }
}


// Compute a simple hash for a message as fallback tx id
function computeMessageHash_(message, amount, currency) {
  try {
    const raw = (message.getFrom ? message.getFrom() : '') + (message.getDate ? message.getDate().toISOString() : '') + (amount || '') + (currency || '');
    const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, raw);
    return Utilities.base64Encode(bytes).replace(/\=+$/, '');
  } catch (e) {
    // last resort
    return 'tx_' + new Date().getTime();
  }
}


// Check whether tx_id already exists in the sheet (simple linear scan)
function isTxProcessed_(sheet, txId) {
  if (!txId) return false;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  const colA = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < colA.length; i++) {
    if (colA[i][0] === txId) return true;
  }
  return false;
}


// Get or create a Gmail label by name
function getOrCreateLabel(name) {
  let label = GmailApp.getUserLabelByName(name);
  if (!label) label = GmailApp.createLabel(name);
  return label;
}


/**
 * Create a time-driven trigger to run processVenmoEmails every N minutes.
 * Call this once from the script editor to auto-install the trigger.
 */
function createVenmoTrigger(minutes) {
  minutes = minutes || 15;
  // Remove existing triggers for this function first
  const existing = ScriptApp.getProjectTriggers();
  existing.forEach(t => {
    if (t.getHandlerFunction() === 'processVenmoEmails') {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('processVenmoEmails')
    .timeBased()
    .everyMinutes(minutes)
    .create();
  Logger.log('createVenmoTrigger: created time trigger every ' + minutes + ' minutes');
}


/**
 * Update the master balance cell if properties define VENMO_MASTER_SHEET and VENMO_MASTER_CELL.
 * VENMO_MASTER_SHEET should be sheet name (in the same spreadsheet as BUDGET_SHEET_ID) or full spreadsheet id if using other sheet.
 * VENMO_MASTER_CELL should be an A1 cell string like 'B2'.
 */
function updateMasterBalance_(txSpreadsheet, txSheet) {
  const props = PropertiesService.getScriptProperties().getProperties();
  const masterSheetNameOrId = props['VENMO_MASTER_SHEET'];
  const masterCell = props['VENMO_MASTER_CELL'];
  if (!masterSheetNameOrId || !masterCell) return; // nothing to do

  // read balance from txSheet K2 (where we stored the sum)
  const balance = txSheet.getRange('K2').getValue();

  try {
    // If the property value looks like a spreadsheet id (long string with d/), attempt to open by id
    let masterSs = null;
    let masterSheet = null;
    if (/^[A-Za-z0-9_-]{20,}$/.test(masterSheetNameOrId)) {
      // assume it's a spreadsheet id
      masterSs = SpreadsheetApp.openById(masterSheetNameOrId);
      masterSheet = masterSs.getSheets()[0];
    } else {
      // same spreadsheet as txSpreadsheet
      masterSs = txSpreadsheet;
      masterSheet = masterSs.getSheetByName(masterSheetNameOrId);
    }

    if (!masterSheet) {
      Logger.log('updateMasterBalance_: master sheet not found: ' + masterSheetNameOrId);
      return;
    }

    masterSheet.getRange(masterCell).setValue(balance).setNumberFormat('$#,##0.00');
    Logger.log('updateMasterBalance_: wrote balance ' + balance + ' to ' + masterSheetNameOrId + '!' + masterCell);
  } catch (e) {
    Logger.log('updateMasterBalance_: error writing to master sheet: ' + e.message);
  }
}


/**
 * Run a simple reconciliation: recompute sum of processed transactions and compare to master cell.
 * If mismatch above threshold, add a note in the VenmoTransactions sheet header notes column.
 */
function reconcileVenmoBalance() {
  const props = PropertiesService.getScriptProperties().getProperties();
  const budgetSheetId = props['BUDGET_SHEET_ID'];
  if (!budgetSheetId) return;

  const ss = SpreadsheetApp.openById(budgetSheetId);
  const txSheet = ss.getSheetByName('VenmoTransactions');
  if (!txSheet) return;

  const sum = txSheet.getRange('K2').getValue();

  const masterSheetNameOrId = props['VENMO_MASTER_SHEET'];
  const masterCell = props['VENMO_MASTER_CELL'];
  if (!masterSheetNameOrId || !masterCell) return;

  try {
    let masterSs = null;
    let masterSheet = null;
    if (/^[A-Za-z0-9_-]{20,}$/.test(masterSheetNameOrId)) {
      masterSs = SpreadsheetApp.openById(masterSheetNameOrId);
      masterSheet = masterSs.getSheets()[0];
    } else {
      masterSs = ss;
      masterSheet = masterSs.getSheetByName(masterSheetNameOrId);
    }

    const masterVal = masterSheet.getRange(masterCell).getValue();
    const diff = Math.abs((sum || 0) - (masterVal || 0));

    // threshold can be configured; default to $0.01
    const threshold = parseFloat(props['VENMO_RECONCILE_THRESHOLD'] || '0.01');
    if (diff > threshold) {
      // write a note into header notes cell
      const note = `Reconcile mismatch: tx_sum=${sum} master=${masterVal} diff=${diff} at ${new Date().toISOString()}`;
      txSheet.getRange('J1').setNote(note);
      Logger.log('reconcileVenmoBalance: ' + note);
    } else {
      txSheet.getRange('J1').setNote('Reconciled OK at ' + new Date().toISOString());
    }
  } catch (e) {
    Logger.log('reconcileVenmoBalance: ' + e.message);
  }
}
