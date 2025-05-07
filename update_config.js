
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
  writeConfig(); // saves config values in script properties and refresh properties var
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
  } catch (err) {
    console.log('Failed to set properties with error %s', err.message);
  }
  properties = PropertiesService.getScriptProperties().getProperties(); // reload after update
  console.log("Finished setting new config vals to script!");
  postSmallEmbed("Successfully wrote new config to script properties!");

}

function pushConfigToBot() {
  let iPAddress = properties['AWS_IP_ADDRESS'];
  const response = UrlFetchApp.fetch(`http://${iPAddress}:3000/update-config`, {
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