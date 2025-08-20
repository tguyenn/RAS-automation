
let mapValues = [];
let mapKeys = [];
let props = {};

function updateConfig() {
  let inputSheetId = properties['ORDER_CONFIG_SHEET_ID'];
  if(inputSheetId == null) {
    Logger.log("WARNING: PLEASE SET THE `ORDER_CONFIG_SHEET_ID` PROPERTY MANUALLY ON FIRST SETUP");
    throw new Error(` Execution aborted because need ORDER_CONFIG_SHEET_ID property to be set manually (Settings > scroll down)`);
  }
  readConfigSheet(inputSheetId); // parse config values from sheet into key and value arrays
  writeConfig(); // saves config values in GAS properties and refresh properties var
  pushConfigToBot();
} 

function readConfigSheet(inputSheetId) {
  const spreadsheet = SpreadsheetApp.openById(inputSheetId); // open arbitrary template sheet 
  const sheet = spreadsheet.getSheetByName("Config");
  mapValues = sheet.getRange('H2:H').getValues(); 
  mapValues = mapValues.map(row => row[0]); // flatten to 1D array
  mapKeys = sheet.getRange('G2:G').getValues();
  mapKeys = mapKeys.map(row => row[0]);
}

function writeConfig() {
  try{
    const scriptProperties = PropertiesService.getScriptProperties();
    for (let i = 0; i < mapKeys.length; i++) { // create key:value mapping
      if(mapKeys[i] == "") continue;
      props[mapKeys[i]] = String(mapValues[i] ?? '');
    }
    scriptProperties.setProperties(props);
    console.log("Finished setting new config vals to GAS!");
    postSmallEmbed("Successfully wrote new config to GAS properties!");
    properties = PropertiesService.getScriptProperties().getProperties(); // reload after update
  } catch (err) {
    console.log('Failed to set GAS properties with error %s', err.message);
  }
}

function pushConfigToBot() {

// commenting our for time being while we figure out a more secure way to do this
  // const keysToRemove = [ // secrets
  //   "BOT_TOKEN",
  //   "AWS_IP_ADDRESS",
  //   "DISCUSSION_WEBHOOK",
  //   "ORDERS_WEBHOOK",
  //   "GOOGLE_API_KEY"
  // ];
  // for (const key of keysToRemove) {
  //   delete props[key]; // will silently skip if key no exist
  // }

  let ipAddress = properties['AWS_IP_ADDRESS'];
  const response = UrlFetchApp.fetch(`http://${ipAddress}:3000/update-config`, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(props)
  });

  const statusCode = response.getResponseCode();
  const content = response.getContentText();

  if (statusCode == 200) {
    Logger.log("Bot config update successful: " + content);
    postSmallEmbed("Successfully wrote new config to bot!");
  } else {
    Logger.log(`Failed to update config. Status: ${statusCode}, Response: ${content}`);
    postSmallEmbed("FAILED TO WRITE CONFIG TO BOT😔😔😔");
  }


}