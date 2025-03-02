/**
 *  read input google sheet and parse data into global variables
 */


function readSheet() {

  const spreadsheet = SpreadsheetApp.openById(inputSheetID); // open arbitrary template sheet 
  const sheet = spreadsheet.getSheetByName("Sheet1"); 


  let lastRow = sheet.getRange("A1:A").getValues(); // get last row with content based on column A
  lastRow = lastRow.filter(String).length;

  // go from X2:XlastRow and store data into respective variables
  for(i = 1; i < 6; i++) { // for each data column
      let range = sheet.getRange(2, i, lastRow - 1); // Read from row 2 to the last row in the column
    let columnData = range.getValues(); // This returns a 2D array (e.g., [[value1], [value2], ...])
    dataArray = columnData.map(row => row[0]); // Flatten to a 1D array
    switch (i) {
      case 1:
        nameArr = dataArray;
        break;
      case 2:
        linksArr = dataArray;
        break;
      case 3:
        quantityArr = dataArray;
        break;
      case 4:
        priceArr = dataArray;
        break;
      case 5:
        descriptionArr = dataArray;
        break;
    }
  }

  let sheetData = sheet.getRange('H3:H9').getValues(); // put data from table on right into an array
  sheetData = sheetData.map(row => row[0]); // flatten to 1D array
  committeeName = sheetData[0];
  vendorName = sheetData[1];
  shippingType = sheetData[2];
  shipping = sheetData[3];
  specialNotes = sheetData[4] + "\n";
  fundingSource = sheetData[5];
  let isClear = sheetData[6];
  // Logger.log("sheet data: " + sheetData);

  itemsOrdered = lastRow - 1;

  switch(committeeName) {
    case "General":
      // nothing
      break;
    case "VEXU":
      thumbNailUrl = "https://i.imgur.com/2vwgZHO.jpg";
      break;
    case "RoboMaster":
      thumbNailUrl = "https://i.imgur.com/4UEoyMs.jpg";
      break;
    case "Demobots":
      thumbNailUrl = "https://i.imgur.com/nrR07HS.jpg";
      break;
    case "IGVC":
      thumbNailUrl = "https://i.imgur.com/M5TQiDf.jpg";
      break;
    case "Robotathon":
      thumbNailUrl = "https://i.imgur.com/XHbsPvd.jpg";
      break;
    default: // if someone forgets to put the committee then the script explodes
      specialErrorMessage = "someone forgot to put the committee lol"
  }

  if(vendorName == "") {
    specialNotes += "Someone forgot to put the vendor 😔\n";
  }

  for(i = 0; i < itemsOrdered; i++) {
    if(quantityArr[i] == 0) {
      specialNotes += "\nSomoene forgot to put quantity🫵🫵🤣🤣🤣 defaulted it to 1"; 
      quantityArr[i] = 1;
    }
  }  

  if(shippingType == "") {
    shippingType = "N/A";
  }

  if(shipping == "") { // prevent empty shipping from breaking total price calculation
    shipping = 0;
  }

  if(fundingSource == "") {
    specialNotes += "\nSomeone forgot to put the funding source ☹️☹️ defaulted to ESL committee funds";
    fundingSource = "ESL Committee Funds";
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

  if (totalPrice > 1500) { // "easter egg" or wtv
    footerUrl = "https://i.imgur.com/1kqpus1.jpg";
    footerText = ":( stop please we are too poor for this";
  }

  if (Math.random() > 0.95 && Math.random() > 0.95) { // more easter egg yay yipee
    thumbNailUrl = "https://www.crownbio.com/hubfs/ras-signaling-pathways-thumb.jpg";
  }

  if(isClear == true) {
    // Logger.log("clearing input sheet!");
    clearSheet(); // clear sheet for next use
  }
}

// delete data from template sheet
function clearSheet() {

  // tbh idk why it wasnt working earlier when passing in sheetID and lastRow in and idc enough to debug :) so this is what u get for now
  inputSheetID = "1Ud5ZEs9mdV4Lk5InK7P9jcXaRlwkBsqSURoN1luDPls";
  const spreadsheet = SpreadsheetApp.openById(inputSheetID);
  const sheet = spreadsheet.getSheetByName("Sheet1"); 
  let lastRow = sheet.getRange("A1:A").getValues(); // read to end of col A
  lastRow = lastRow.filter(String).length;

  Logger.log("lastRow: " + lastRow);

  let range = sheet.getRange(2, 1, lastRow, 5); 
  range.clearContent(); // clear main data
  sheet.getRange('H3:H8').clearContent(); // clear Other Information table


  sheet.getRange('H8').setValue("ESL Committee Funds"); // default

}