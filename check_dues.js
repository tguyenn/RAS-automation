// NOT TIED TO OTHER SCRIPT FILES

// periodically run this script every 10 minutes or something

// note this functionality could be implemented more easily (?) using the IMPORTDATA function in google sheets. however, im not sure how often that gets updated, so we are using this for better live data / control

// Keep track of last submitted donation by saving the last read ID in script properties. Use this as a landmark to see which donations are new

let newDonData = [];

function checkDues() {
  let numResults = 30;
  const hcbName = properties["HCB_ORG_NAME"];
  const url = `https://hcb.hackclub.com/api/v3/organizations/${hcbName}/donations?expand=amount_cents&per_page=${numResults}`;
  const options = {method: 'GET', headers: {Accept: 'application/json'}};
  result = UrlFetchApp.fetch(url, options);
  result = result.getContentText();
  let data = JSON.parse(result);
  
  let lastID = PropertiesService.getScriptProperties().getProperty('LAST_ID');
  if(lastID == data[0].id) {
    Logger.log(`data[0].id is the same as ${lastID}! Last person to donate was ${data[0].donor.name}! exiting...`);
    return;
  }
  else {
    for(i = 0; i < numResults; i++) {
      if(data[i].id == lastID) {
        Logger.log(`found lastID: ${lastID}. killing!`);
        break;  // if found the ID checked last time, then break 
      }
      else {
        let donName = data[i].donor.name;
        let donAmount = data[i].amount_cents / 100;
        let donDate = data[i].date;
        if(donAmount == 15 || donAmount == 16.05) { // if is dues amount
          let buffer = [
            donDate,
            donName,
            donAmount
          ];
          newDonData.push(buffer);
          Logger.log(`${donName} made a generous donation of ${donAmount} on ${donDate}!`);
        }
      }
    }
    if(newDonData.length > 0) {
      logDonors(); // record donor data in sheet
      lastID = data[0].id; // replace with the first (top) of the list
      PropertiesService.getScriptProperties().setProperty("LAST_ID", lastID);
      Logger.log(`updated lastID to ${lastID}`);
    }
  }
}

function logDonors() {
  console.log(newDonData);
  let inputSheetID = properties["BUDGET_SHEET_ID"];
  const spreadSheet = SpreadsheetApp.openById(inputSheetID); 
  let sheet = spreadSheet.getSheetByName("Raw Dues Parsing (HCB)"); 

  targetRow = sheet.getLastRow() + 1;
  sheet.getRange(targetRow, 1, newDonData.length, 3).setValues(newDonData);
}
