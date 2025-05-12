// NOT TIED TO OTHER SCRIPT FILES

// expose this as an endpoint (deploy as web app) so discord bot can tell script to mark appropriate order group as placed

function markChecks(numItems, tag, committeeName) {
    let mastersheetID = properties['BUDGET_SHEET_ID'];
    const spreadsheet = SpreadsheetApp.openById(mastersheetID);
    Logger.log("opening sheet of: " + committeeName);
    const sheet = spreadsheet.getSheetByName(committeeName); 
    const columnO = sheet.getRange('O:O').getValues(); // Get all tag values in column O

    for (let i = 0; i < columnO.length; i++) {
        if (columnO[i][0] == tag) {
            let targetRow = i + 1;
            // mark (targetRow, 1, targetRow + numItems, 1) as TRUE
            let checkBoxRange = sheet.getRange(targetRow, 2, numItems, 1);
            checkBoxRange.setValue(true);
            console.log(`setting row ${targetRow} to ${targetRow + numItems} as TRUE`);
            return "successfully wrote to checkboxes!";
        }
    }
    console.log("tag not found :(");
    return 'tag not found';
}