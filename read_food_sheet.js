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
  let inputSheetID = properties['ORDER_CONFIG_SHEET_ID'];
  const spreadsheet = SpreadsheetApp.openById(inputSheetID); // open arbitrary template sheet 
  const sheet = spreadsheet.getSheetByName("Food Invoice"); 

  let sheetData = sheet.getRange('C3:C17').getValues(); // put data from table on right into an array
  sheetData = sheetData.map(row => row[0]); // flatten to 1D array
  vendorName = sheetData[0];
  foodType = sheetData[1];
  restAddy = sheetData[2];
  restPhone = sheetData[3];
  reqReason = sheetData[4];
  eventLoc = sheetData[5];
  eventDate = Utilities.formatDate(sheetData[6], Session.getScriptTimeZone(), "M/d/yyyy"); // otherwise GAS parses it as a raw date object (too much info)
  attendCount = sheetData[7];
  timeBlock = sheetData[8];
  specTime = sheetData[9];
  personName = sheetData[10];
  personEmail = sheetData[11];
  personEid = sheetData[12];
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

  // only use one cost. reject input if there are 2
  if(estCost && actCost) {
    specialErrorMessage += `Someone put 2 different costs (choose one)`;
    throw new Error(`Execution aborted bc someone put two costs`);
  }
  else if(estCost) { 
    priceArr[0] = estCost;
  }
  else if(actCost){
    priceArr[0] = actCost;
  }
  totalPrice = priceArr[0];

  if(estCost == "" && actCost == "") {
      specialErrorMessage += `Someone forgot to put a cost`;
      throw new Error(`Execution aborted bc someone forgor to put the cost`);
  }

  for(i = 0; i < 12; i++) {
    if(sheetData[i] == "") {
      specialErrorMessage += `someone forgot to put the ${fieldNames[i]}`;
      throw new Error(`Execution aborted bc someone forgor to put the ${fieldNames[i]}`);
    }
  }

  itemsOrdered = 1;
  fundingSource = "ESL Committee Funds";
  quantityArr[0] = 1;
  nameArr[0] = `${foodType}`
  linksArr[0] = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  committeeName = properties['COMMITTEE_NAME_1'];
  thumbNailUrl = "https://i.imgur.com/jvF3FoH.jpg";
  isPosting = true;

}