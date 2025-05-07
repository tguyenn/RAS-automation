/**
 *  read input google sheet and parse data into global variables
 */


function readNormalSheet() {

  let inputSheetID = properties['ORDER_CONFIG_SHEET_ID'];
  const spreadsheet = SpreadsheetApp.openById(inputSheetID); // open arbitrary template sheet 
  const sheet = spreadsheet.getSheetByName("Materials Order"); 

  let lastRow = sheet.getRange("A1:A").getValues(); // get last row with content based on column A
  lastRow = lastRow.filter(String).length;

  // Get all data from columns 1 to 5, starting from row 2 to lastRow
  let range = sheet.getRange(2, 1, lastRow - 1, 5); // (startRow, startCol, numRows, numCols)
  let allData = range.getValues(); // 2D array: [[name, link, quantity, price, description], ...]

  // Split columns into individual arrays
  allData.forEach(row => {
    nameArr.push(row[0]);
    linksArr.push(row[1]);
    quantityArr.push(row[2]);
    priceArr.push(row[3]);
    descriptionArr.push(row[4]);
  });


  let sheetData = sheet.getRange('H3:H10').getValues(); // put data from table on right into an array
  sheetData = sheetData.map(row => row[0]); // flatten to 1D array
  committeeName = sheetData[0];
  vendorName = sheetData[1];
  shippingType = sheetData[2];
  shipping = sheetData[3];
  specialNotes = sheetData[4] + "\n";
  fundingSource = sheetData[5];
  let needsClear = sheetData[6];
  isPosting = sheetData[7];
  // Logger.log("sheet data: " + sheetData);

  itemsOrdered = lastRow - 1;
  console.log("items ordered: " + itemsOrdered);
  console.log("items: " + nameArr);

  for(i = 1; i <= properties['NUM_COMMITTEES']; i++) {
    if(committeeName == properties[`COMMITTEE_NAME_${i}`]) {
      thumbNailUrl = properties[`COMMITTEE_ICONS_LINK_${i}`];
    }
  }
  if(thumbNailUrl == "") {
    specialErrorMessage = "Someone forgot to put the committee 🤷\n"
    throw new Error("Execution aborted bc someone forgor to put the committee");
  }

  if(vendorName == "") {
    specialErrorMessage += "Someone forgot to put the vendor 😔\n";
    throw new Error("Execution aborted bc someone forgor to put the vendor");
  }

  for(i = 0; i < itemsOrdered; i++) {
    if(quantityArr[i] == 0) {
      specialErrorMessage += `Somoene forgot to put quantity for ${nameArr[i]} 😢 defaulted it to 1\n`;
      quantityArr[i] = "1"; 
    }
  }  

  if(shippingType == "") {
    shippingType = "N/A";
  }

  if(shipping == "") { // prevent empty shipping from breaking total price calculation
    shipping = 0;
  }

  if(fundingSource == "") {
    specialErrorMessage += "Someone forgot to put the funding source ☹️☹️ defaulted to ESL committee funds\n";
    fundingSource = "ESL Committee Funds";
  }
  
  if((fundingSource !== "ESL Committee Funds") && (fundingSource !== "HCB Committee Funds")) {
    specialNotes += `This order should use funds from ${fundingSource} grant`;
  }

  if(specialNotes == "") {
    specialNotes = "N/A";
  }

  if(vendorName == "Amazon" || vendorName == "amazon" || vendorName == "AMZN" || vendorName == "AMAZON") {
    isAmazon = true;
  }

  for(let i = 0; i < itemsOrdered; i++) {
    totalPrice += (parseFloat(priceArr[i]) * parseInt(quantityArr[i]));
  }
  totalPrice += parseFloat(shipping);
  totalPrice = parseFloat(totalPrice.toFixed(2)); // prevent weird decimals

  if(needsClear == true) {
    // Logger.log("clearing input sheet!");
    clearSheet(sheet); // clear sheet for next use
  }
}

// delete data from sheet
function clearSheet(sheet) {

  let lastRow = sheet.getRange("A1:A").getValues(); // read to end of col A
  lastRow = lastRow.filter(String).length;

  Logger.log("lastRow: " + lastRow);

  let range = sheet.getRange(2, 1, lastRow, 5); 
  range.clearContent(); // clear main data
  sheet.getRange('H3:H8').clearContent(); // clear Other Information table

  sheet.getRange('H8').setValue("ESL Committee Funds"); // default

}