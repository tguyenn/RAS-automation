
let mapValues = [];
let mapKeys = [];

function updateConfig() {
  test = PropertiesService.getScriptProperties().getProperties();
  console.log("test: " + test['ORDER_CONFIG_SHEET_ID']);
  console.log("properties: " + properties['ORDER_CONFIG_SHEET_ID']);
  
  let inputSheetId = properties['ORDER_CONFIG_SHEET_ID'];
  if(inputSheetId == null) {
    Logger.log("WARNING: PLEASE SET THE `ORDER_CONFIG_SHEET_ID` PROPERTY MANUALLY ON FIRST SETUP");
    throw new Error(` Execution aborted because need ORDER_CONFIG_SHEET_ID property to be set manually (Settings > scroll down)`);
  }


  const spreadsheet = SpreadsheetApp.openById(inputSheetId); // open arbitrary template sheet 
  const sheet = spreadsheet.getSheetByName("Config");
  readConfigSheet(sheet); // parse config values from sheet into key and value arrays
  writeConfig(); // saves config values in script properties
} 

function readConfigSheet(sheet) {
  mapValues = sheet.getRange('H2:H').getValues(); 
  mapValues = mapValues.map(row => row[0]); // flatten to 1D array
  mapKeys = sheet.getRange('G2:G').getValues();
  mapKeys = mapKeys.map(row => row[0]);
}

function writeConfig() {
  try{
    const scriptProperties = PropertiesService.getScriptProperties();
    let props = {};
    for (let i = 0; i < mapKeys.length; i++) { // create key:value mapping
      if(mapKeys[i] == "") continue;
      props[mapKeys[i]] = String(mapValues[i] ?? '');
    }
    scriptProperties.setProperties(props);
  } catch (err) {
    console.log('Failed to set properties with error %s', err.message);
  }
  properties = PropertiesService.getScriptProperties().getProperties(); // reload after update
  console.log("Finished setting new config vals!");
  postSmallEmbed("Successfully wrote new config to script properties!");

}