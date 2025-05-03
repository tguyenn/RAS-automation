/** 
 * edit master budget sheet
 * */ 


function editMasterSheet() {

  let mastersheetID = "1uw0LqBbjbEuq2X-QjBsj0W6ebI_K2bclHLlOi9tjy1Q"; // https://docs.google.com/spreadsheets/d/1uw0LqBbjbEuq2X-QjBsj0W6ebI_K2bclHLlOi9tjy1Q/edit?gid=1275180039#gid=1275180039
  const spreadsheet = SpreadsheetApp.openById(mastersheetID);

  Logger.log("appending to budget sheet of committee: " + committeeName);
  const sheet = spreadsheet.getSheetByName(committeeName); 

  targetRow = sheet.getLastRow() + 1;

  const today = new Date();
  const formattedDate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();

  let originalTargetRow = targetRow;
  for(i = 0; i < itemsOrdered; i++) {
    let itemTotalPrice = "=PRODUCT(J" + targetRow + "," + " K" + targetRow + ") + L" + targetRow;

    // append all data in order starting with Product Name column in the sheet
    let newData = [nameArr[i], descriptionArr[i], vendorName, linksArr[i], quantityArr[i], priceArr[i], 0, itemTotalPrice, fundingSource, orderID]; // 0 is for shipping
    sheet.getRange(targetRow, 6, 1, newData.length).setValues([newData]);
    // set date in column A
    sheet.getRange(targetRow, 1).setValue(formattedDate); 

    targetRow++;
  }

    sheet.getRange(originalTargetRow, 12, 1).setValue(shipping); //overwrite 0 for shipping in first newly written row

  if(fundingSource != "ESL Committee Funds") { 
    editGrants(spreadsheet);
  }
}

function editGrants(spreadsheet) {  
  const sheet = spreadsheet.getSheetByName("Grant Tracking"); 

// Date	Grant	Committee	Item Total	Vendor
  let targetRow = sheet.getLastRow() + 1;
  let savedTargetRow = targetRow;
  const today = new Date();
  const formattedDate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
  for(i = 0; i < itemsOrdered; i++) {
    let itemTotalPrice = quantityArr[i] * priceArr[i];

    let newData = [formattedDate, fundingSource, committeeName, nameArr[i], itemTotalPrice, vendorName];
    sheet.getRange(targetRow, 1, 1, newData.length).setValues([newData]);
    targetRow++;
  }
  let buf = sheet.getRange(savedTargetRow, 5).getValue();  // Get single value
  buf = parseFloat(buf);  // Parse as float
  buf += shipping;  // Add shipping
  buf = parseFloat(buf.toFixed(2));  // Round to 2 decimal places
  sheet.getRange(savedTargetRow, 5).setValue(buf);  // Set single value
}