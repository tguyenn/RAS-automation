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
    let newData = [nameArr[i], descriptionArr[i], vendorName, linksArr[i], quantityArr[i], priceArr[i], 0, itemTotalPrice, fundingSource]; // 0 is for shipping
    sheet.getRange(targetRow, 6, 1, newData.length).setValues([newData]);
    // set date in column A
    sheet.getRange(targetRow, 1).setValue(formattedDate);

    targetRow++;
  }

    sheet.getRange(originalTargetRow, 12, 1).setValue(shipping); //overwrite 0 for shipping in first newly written row

  if(fundingSource != "ESL Committee Funds") { 
    editGrants(spreadsheet);
  }
  // checkESLbudget(mastersheetID);

}

// i aint paid enough to redo this for ESL and grant budgets
// function checkESLbudget(mastersheetID) {
//     let rowNum = 0;
//     switch(committeeName) {
//     case "Demobots":
//       rowNum = 10;
//       break;
//     case "IGVC":
//       rowNum = 11;
//       break;
//     case "RoboMaster":
//       rowNum = 12;
//       break;
//     case "Robotathon":
//       rowNum = 13;
//       break;
//     case "VEXU":
//       rowNum = 14;
//     break;
//     case "General":
//       return; // escape bc there is no consolidated "general" budget atm
//   }
//   const spreadsheet = SpreadsheetApp.openById(mastersheetID);
//   const sheet = spreadsheet.getSheetByName("2024-2025 Budget");
//   let data = sheet.getRange(rowNum, 5).getValues();
//   let remBudget = data.map(row => row[0]);
//   console.log("remaining budget: " + remBudget);

//   if((remBudget - totalPrice) < 0) { 
//     console.log("ran outta money man :(");
//     specialErrorMessage += "\nRAN OUT OF MONEY NOOOOOO (budget for this committee is in the red!!) (data still appended to sheet tho good luck lol)";
//   }
// }

function editGrants(spreadsheet) {
              // let mastersheetID = "1uw0LqBbjbEuq2X-QjBsj0W6ebI_K2bclHLlOi9tjy1Q"; // https://docs.google.com/spreadsheets/d/1uw0LqBbjbEuq2X-QjBsj0W6ebI_K2bclHLlOi9tjy1Q/edit?gid=1275180039#gid=1275180039
              // spreadsheet = SpreadsheetApp.openById(mastersheetID);
  const sheet = spreadsheet.getSheetByName("Grant Tracking"); 
              // fundingSource = "RoboMaster CSE Travel Grant"
              // itemsOrdered = 3;


  Logger.log("searching for " + fundingSource);
  // search for row with grant name
  let values = sheet.getRange("B1:B").getValues();
  Logger.log("values " + values);
  let grantTitleRow = 0;
  for(i = 1; i < values.length; i++) {
    if(values[i] == fundingSource) { 
      grantTitleRow = i + 1;
      Logger.log("found grant title row at row: " + (grantTitleRow));
      break;
    }
  }
  if(grantTitleRow == 0) {
    Logger.log("Could not find Grant Title Row");
    specialErrorMessage += "\nCould not find Grant Title Row\n"
    return;
  }

  let targetRow = grantTitleRow + 2;
  let savedTargetRow = targetRow;
  // insert enough blank rows to accomodate new data
  sheet.insertRows(targetRow, itemsOrdered);  // insert itemsOrderedRows *before* row targetRow

  // begin writing data
  const today = new Date();
  const formattedDate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
  for(i = 0; i < itemsOrdered; i++) {
    let itemTotalPrice = quantityArr[i] * priceArr[i];

    // append all data in order starting with Product Name column in the sheet
    let newData = [formattedDate, committeeName, nameArr[i], itemTotalPrice];
          // let newData = [formattedDate, committeeName, i, i];
    sheet.getRange(targetRow, 2, 1, newData.length).setValues([newData]);
    targetRow++;
  }

  // include shipping in top entry
  let preShippingNum = sheet.getRange(savedTargetRow, 5).getValues()[0][0];
  let postShippingNum = parseFloat(preShippingNum) + shipping;
  postShippingNum = parseFloat(postShippingNum.toFixed(2));
  sheet.getRange(savedTargetRow, 5).setValue(postShippingNum);

  // calculate new total cost value for summary table
  values = sheet.getRange(savedTargetRow, 5, 200, 1).getValues();
  values = values.map(row => row[0]); // flatten to 1D

  let upperBound = 0;
  // slice array so that it is only relevant numbers
  for(i = 0; i < values.length; i++) { 
    if(typeof values[i] !== 'number') {
      upperBound = i + 1;
      break;
    }
  }

  Logger.log(values);
  Logger.log("upperbound " + upperBound);
  let subArr = values.slice(0, upperBound);
  Logger.log("subarr " + subArr);
  let costSum = 0;
  for(i = 0; i < subArr.length; i++) {
    costSum += subArr[i];
  }
  Logger.log("costSum" + costSum);


  // find target in summary table
  values = sheet.getRange("A1:A").getValues();
  let grantNameRow = 0;
  for(i = 1; i < values.length; i++) {
    if(values[i] == fundingSource) { 
      grantNameRow = i + 1;
      Logger.log("found grantNameRow at row: " + (grantNameRow));
      break;
    }
  }
  if(grantTitleRow == 0) {
    Logger.log("Could not find grantNameRow");
    specialErrorMessage += "\nCould not find grantNameRow\n"
    return;
  }
  // write to summary table
  sheet.getRange(grantNameRow, 3).setValue(costSum);


}