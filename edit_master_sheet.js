/** 
 * edit master budget sheet
 * */ 


function editMasterSheet() {

  let mastersheetID = properties['BUDGET_SHEET_ID']; 
  const spreadsheet = SpreadsheetApp.openById(mastersheetID);

  Logger.log("appending to budget sheet of committee: " + committeeName);
  const sheet = spreadsheet.getSheetByName(committeeName); 

  targetRow = sheet.getLastRow() + 1;

  const today = new Date();
  const formattedDate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();

  let allData = [];
  let dateValues = [];

  for (let i = 0; i < itemsOrdered; i++) {
    let row = targetRow + i;
    let itemTotalFormula = `=PRODUCT(J${row}, K${row}) + L${row}`;
    
    let newData = [
      subCommitteeName,
      nameArr[i],
      descriptionArr[i],   
      vendorName,          
      linksArr[i],         
      quantityArr[i],      
      priceArr[i],         
      0,                   // shipping
      itemTotalFormula,    // total price
      fundingSource,       
      orderID              
    ];
    console.log(nameArr[i]);
    if(i == 0) {
      newData[7] = shipping; // first row should have shipping applied
    }
    
    allData.push(newData);
    dateValues.push([formattedDate]); // For column A
  }

  // Set all all dates (column A) and all row data at once (columns F to O)
  console.log("writing data to budget sheet: " + allData);
  sheet.getRange(targetRow, 1, itemsOrdered, 1).setValues(dateValues);
  sheet.getRange(targetRow, 5, itemsOrdered, allData[0].length).setValues(allData);


  if(fundingSource != "ESL Committee Funds") { 
    console.log("writing data to grant sheet");
    editGrants(spreadsheet);
  }
}

function editGrants(spreadsheet) {  
  const sheet = spreadsheet.getSheetByName("Grant Tracking"); 


  let lastRow = sheet.getRange("B1:B").getValues(); // get last row with content based on column B
  lastRow = lastRow.filter(String).length + 1; 
  console.log("grant last row:" + lastRow);

  const today = new Date();
  const formattedDate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();

// Date	Grant	Committee	Item Total Vendor
  let allData = [];
  for (let i = 0; i < itemsOrdered; i++) {
    let itemTotalPrice = quantityArr[i] * priceArr[i];
    let newData = [
      formattedDate,     // Column A
      fundingSource,     // B
      committeeName,     // C
      nameArr[i],        // D
      itemTotalPrice,    // E
      vendorName         // F
    ];
    if(i == 0) { // apply shipping to first item
      newData[4] += shipping;
      console.log("item total price with shipping: " + itemTotalPrice);
    }
    allData.push(newData);
  }

  // Set all rows in one call (columns A to F)
  sheet.getRange(lastRow, 1, itemsOrdered, allData[0].length).setValues(allData);
}