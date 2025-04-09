// Keep track of last submitted donation by saving the last read ID. Use this as a landmark to see which donations are new
// post thing to Discord 

function checkDues() {
  
  let numResults = 30;

  // retrieve data via API call to HCB
  const url = `https://hcb.hackclub.com/api/v3/organizations/austin-ieee-ras/donations?expand=amount_cents&per_page=${numResults}`;
  const options = {method: 'GET', headers: {Accept: 'application/json'}};
  result = UrlFetchApp.fetch(url, options);
  result = result.getContentText();
  let data = JSON.parse(result);
  // Logger.log(data);
  // for(j = 0; j < numResults; j++) {
  //   Logger.log(data[j].id);
  // }
  
  let lastID = PropertiesService.getScriptProperties().getProperty('DYNAMIC_TEST_VAL');
  if(lastID == data[0].id) {
    Logger.log(`data[0].id is the same as ${lastID}! exiting...`);
    return;
  }
  else {

    for(i = 0; i < numResults; i++) {
      Logger.log(`checking index ${i}`);
      if(data[i].id == lastID) {
        Logger.log(`found lastID: ${lastID}. killing!`);
        break;  // if found the ID checked last time, then break 
      }
      else {
        let name = data[i].donor.name;
        let donAmount = data[i].amount_cents / 100;

        // test. replace with dues tracking later
        Logger.log(`${name} made a generous donation of ${donAmount}!`);
        postSmallEmbed(`${name} made a generous donation of ${donAmount}!`);
      }
    }

    lastID = data[0].id; // replace with the first (top) of the list
    PropertiesService.getScriptProperties().setProperty('DYNAMIC_TEST_VAL', lastID);
    Logger.log(`updated lastID to ${lastID}`)
  }
  

}
