let foodType;
let reqReason;
let restAddy;
let restPhone;
let timeBlock;
let specTime;
let personName;
let personEmail;
let personEid;
let eventLoc;
let eventDate;
let attendCount;
let estCost;
let actCost;

function readFoodSheet() {
  let inputSheetID = "1Ud5ZEs9mdV4Lk5InK7P9jcXaRlwkBsqSURoN1luDPls";
  const spreadsheet = SpreadsheetApp.openById(inputSheetID); // open arbitrary template sheet 
  const sheet = spreadsheet.getSheetByName("Food Invoice"); 

  let sheetData = sheet.getRange('C3:C17').getValues(); // put data from table on right into an array
  sheetData = sheetData.map(row => row[0]); // flatten to 1D array
  vendorName = sheetData[0];
  foodType = sheetData[1];
  reqReason = sheetData[2]; // reason for request
  restAddy = sheetData[3];
  restPhone = sheetData[4];
  timeBlock = sheetData[5];
  specTime = sheetData[6];
  personName = sheetData[7];
  personEmail = sheetData[8];
  personEid = sheetData[9];
  eventLoc = sheetData[10];
  eventDate = Utilities.formatDate(sheetData[11], Session.getScriptTimeZone(), "M/d/yyyy"); // otherwise GAS parses it as a raw date object (too much info)
  attendCount = sheetData[12];
  estCost = sheetData[13];
  actCost = sheetData[14];

  const fieldNames = [
  "Vendor",
  "Kind of Food",
  "Reason for Request",
  "Restaurant Address",
  "Restaurant Phone Number",
  "Reservation Time Block",
  "Food Card Pickup Time",
  "Food Card Person Name",
  "Food Card Person Email",
  "EID",
  "Event Location",
  "Date of Event",
  "Number of Attendees",
  "Estimated Cost",
  "Actual Cost"];

  if(estCost && actCost) {
    specialErrorMessage += `Someone put 2 different costs (choose one)`;
    throw new Error(`Execution aborted bc someone put two costs`);
  }
  else if(estCost) { 
    priceArr[0] = estCost; // only choose one as per the pdf
  }
  else if(actCost){
    priceArr[0] = actCost;
  }
  totalPrice = priceArr[0];

  if(estCost === "" && actCost === "") {
      specialErrorMessage += `Someone forgot to put a cost`;
      throw new Error(`Execution aborted bc someone forgor to put the cost`);
  }

  for(i = 0; i < 12; i++) {
    if(sheetData[i] === "") {
      specialErrorMessage += `someone forgot to put the ${fieldNames[i]}`;
      throw new Error(`Execution aborted bc someone forgor to put the ${fieldNames[i]}`);
    }
  }

  itemsOrdered = 1;
  fundingSource = "ESL Committee Funds";
  quantityArr[0] = 1;
  nameArr[0] = `${foodType}`
  linksArr[0] = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  committeeName = "General";
  thumbNailUrl = "https://i.imgur.com/jvF3FoH.jpg";
  isPosting = true;

}