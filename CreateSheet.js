/**
 *  create new sheet and populate with data
 */

// publicly exposed function that creates URL for newly generated sheet
function getSheet() {
  let sheet = createSheet();
  createTemplate(sheet);
  populateData(sheet);
}

// create spreadsheet and place in specific folder in Google Drive
function createSheet() {
  let today = new Date();
  let formattedDate = (today.getMonth() + 1) + '.' + today.getDate() + '.' + today.getFullYear();
  const spreadsheetName =  formattedDate + " " + vendorName;
  const folderId = "12ZWilnix5Hu9dVWPDvMY_lwToCCMo319"; // https://drive.google.com/drive/folders/12ZWilnix5Hu9dVWPDvMY_lwToCCMo319
 
  // Create the new spreadsheet
  const newSpreadsheet = SpreadsheetApp.create(spreadsheetName); 
  newSheetUrl = newSpreadsheet.getUrl();
  const file = DriveApp.getFileById(newSpreadsheet.getId());
  const folder = DriveApp.getFolderById(folderId); // move the file to the specified folder
  file.moveTo(folder);
  
  const sheet = newSpreadsheet.getSheetByName("Sheet1"); 
  return sheet;
}

// format sheet to match official ESL sheet
function createTemplate(sheet) {
  // set main headers
  let range = sheet.getRange("A1:G1");
  range.setBackground("#eab676");
  range.setFontWeight("bold");
  range.setHorizontalAlignment("center");
  const headers = ["Item", "Quantity", "Cost Per Item", "Total Cost", "Item/SKU Number", "Other specs", "Link"]
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // summary box setup
  range = sheet.getRange("I2:J2"); // summary table title
  range.setBackground("#DEC484");
  range.setFontWeight("bold");
  range.setHorizontalAlignment("center");
  range.setValue("Summary");
  range.merge();
  // summary table body setup
  range = sheet.getRange("I3:J5"); 
  range.setBackground("#E2D8A5");
  const summaryHeaders = ["Shipping Preference: ", "Shipping Cost: ", "Grand Total: "];
  const summaryData = summaryHeaders.map(header => [header]);  
  range = sheet.getRange(3, 9, summaryData.length, 1);
  range.setValues(summaryData);  
}
// fill template with data


function populateData(sheet) {
  sheet.getRange("G:G").setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  for(let i = 0; i < itemsOrdered; i++) {
    const totalItemPrice = "=PRODUCT(B" + (i+2) + "," + " C" + (i+2) + ")";
    const newData = [nameArr[i], quantityArr[i], priceArr[i], totalItemPrice]
    sheet.getRange(i + 2, 1, 1, newData.length).setValues([newData]); // set all data except link
    sheet.getRange(i + 2, 7, 1, 1).setValue(linksArr[i]);  // set link
  }
  sheet.getRange("J3").setValue(shippingType).setHorizontalAlignment("right");
  sheet.getRange("J4").setValue(shipping).setNumberFormat("$#,##0.00");
  sheet.getRange("J5").setValue("=SUM(D:D, J4)").setNumberFormat("$#,##0.00"); // grand total
}