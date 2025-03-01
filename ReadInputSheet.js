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

  let miscData = sheet.getRange('H3:H7').getValues(); // put data from table on right into an array
  miscData = miscData.map(row => row[0]); // flatten to 1D array

  committeeName = miscData[0];
  vendorName = miscData[1];
  shippingType = miscData[2];
  shipping = miscData[3];
  specialNotes = miscData[4] + "\n";

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

  if(vendorName == "Amazon" || vendorName == "amazon" || vendorName == "AMZN" || vendorName == "AMAZON") {
    isAmazon = true;
  }

  if(email == "") {
    email = "N/A";
  }

  if(shippingType == "") {
    shippingType = "N/A";
  }

  if(vendorName == "") {
    specialNotes += "Someone forgot to put the vendor 😔\n";
  }


  for(i = 0; i < itemsOrdered; i++) {
    if(quantityArr[i] == 0) {
      specialNotes += "\nSomoene forgot to put quantity point and laugh 🫵🫵🤣🤣🤣 defaulted to 1"; 
      quantityArr[i] = 1;
    }
  }  

  if(shipping == "") { // prevent empty shipping from breaking total price calculation
    shipping = 0;
  }

  for(let i = 0; i < itemsOrdered; i++) {
    totalPrice += (parseFloat(priceArr[i]) * parseInt(quantityArr[i]));
  }
  totalPrice += parseFloat(shipping);

  if (totalPrice > 1500) { // "easter egg" or wtv
    footerUrl = "https://i.imgur.com/1kqpus1.jpg"
    footerText = "holy shit we cant afford this"
  }

  if (Math.random() > 0.95 && Math.random() > 0.95) { // more easter egg yay yipee
    thumbNailUrl = "https://www.crownbio.com/hubfs/ras-signaling-pathways-thumb.jpg";
  }

  if(specialNotes == "") {
    specialNotes = "N/A";
  }
  // clearSheet(lastRow, sheet); // clear sheet for next use
}

// delete data from template sheet
function clearSheet(lastRow, sheet) {
  let range = sheet.getRange(2, 1, lastRow, 5); 
  range.clearContent(); // clear main data
  sheet.getRange('H3:H9').clearContent(); // clear 
}