/** 
 * edit master budget sheet
 * */ 

function editMasterSheet() {
  let sheetID = "1uw0LqBbjbEuq2X-QjBsj0W6ebI_K2bclHLlOi9tjy1Q"; // https://docs.google.com/spreadsheets/d/1uw0LqBbjbEuq2X-QjBsj0W6ebI_K2bclHLlOi9tjy1Q/edit?gid=1275180039#gid=1275180039

  const spreadsheet = SpreadsheetApp.openById(sheetID);

  Logger.log("appending to budget sheet of committee: " + committeeName);
  const sheet = spreadsheet.getSheetByName(committeeName); 

  checkCommitteeBudget(sheetID);

  targetRow = sheet.getLastRow() + 1;

  const today = new Date();
  const formattedDate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();

  let originalTargetRow = targetRow;
  for(i = 0; i < itemsOrdered; i++) {
    let itemTotalPrice = "=PRODUCT(J" + targetRow + "," + " K" + targetRow + ") + L" + targetRow;

    // append all data in order starting with Product Name column in the sheet
    let newData = [nameArr[i], descriptionArr[i], vendorName, linksArr[i], quantityArr[i], priceArr[i], 0, itemTotalPrice]; // 0 is for shipping
    sheet.getRange(targetRow, 6, 1, newData.length).setValues([newData]);
    // set date in column A
    sheet.getRange(targetRow, 1).setValue(formattedDate);

    targetRow++;
  }

  sheet.getRange(originalTargetRow, 12, 1).setValue(shipping); //overwrite 0 for shipping in first newly written row

}

function checkCommitteeBudget(sheetID) {
    let rowNum = 0;
    switch(committeeName) {
    case "Demobots":
      rowNum = 10;
      break;
    case "IGVC":
      rowNum = 11;
      break;
    case "RoboMaster":
      rowNum = 12;
      break;
    case "Robotathon":
      rowNum = 13;
      break;
    case "VEXU":
      rowNum = 14;
    break;
  }
  const spreadsheet = SpreadsheetApp.openById(sheetID);
  const sheet = spreadsheet.getSheetByName("2024-2025 Budget");
  let data = sheet.getRange(rowNum, 5).getValues();
  let remBudget = data.map(row => row[0]);
  console.log("remaining budget: " + remBudget);

  if((remBudget - totalPrice) < 0) { 
    console.log("ran outta money man :(");
    specialErrorMessage += "\nRAN OUT OF MONEY NOOOOOO (budget for this committee is in the red!!)";
  }
}