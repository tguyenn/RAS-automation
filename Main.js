// GLOBAL VARIABLES
let amazonBuyerName = "Annie Vu"; // for Amazon ESL form
let amazonBuyerDiscordTag = "<@365619835939455005>"; // Annie Vu 
// let discordTag = "<@533956992272695297>" ; // default ping recipient
let discordTag = "init discord tag here" ; // ping nobody
let thumbNailUrl = "https://i.imgur.com/jvF3FoH.jpg";  // default
let footerUrl = ""; // required for Discord embed's footer
let footerText = ""; // bottom text of embed
let newSheetUrl = "";
let inputSheetID = "";
let email = "N/A"; // for notification to form submitter
let committeeName = "";
let fundingSource = "";
let vendorName = "";
let specialNotes = "N/A";
let shippingType = "N/A";
let itemsOrdered = 0;
let shipping = 0;
let totalPrice = 0;
let isAmazon = false;
let hasSpreadsheet = false; // if user submits spreadsheet
let eslLinkRes = "";
let amazonLink = "";
let specialErrorMessage = ""; // normal message text outside (at top) of embed 
let nameArr = [];
let quantityArr = [];
let linksArr = [];
let priceArr = [];
let descriptionArr = [];

const properties = PropertiesService.getScriptProperties().getProperties(); // loads properties map with values defined in project properties (Settings > scroll down)



// note: there is no particular order to this --- the only order that matters is that parseForm() and readSheet() are placed first and second respectively
function mainOnSubmit(e) {
  
  try{
    parseForm(e);
  } catch(e) {
    let stack = e.stack.split("\n");
    let lineInfo = stack.length > 1 ? stack[1] : "No line info";
    Logger.log("Error in parseForm(): " + e.message);
    Logger.log("Occurred at: " + lineInfo);
    postKill("Error processing parseForm() with " + e);
    return;
  }
  
  if(hasSpreadsheet) {
    try {
      readSheet();
    } catch(e) {
      let stack = e.stack.split("\n");
      let lineInfo = stack.length > 1 ? stack[1] : "No line info";
      Logger.log("Error in readSheet(): " + e.message);
      Logger.log("Occurred at: " + lineInfo);
      postKill("Error processing readSheet() with " + e);
      return;
    }
  }

  try{
    eslLinkRes = getESLForm();
  } catch(e) {
    let stack = e.stack.split("\n");
    let lineInfo = stack.length > 1 ? stack[1] : "No line info";
    Logger.log("Error in getESLForm(): " + e.message);
    Logger.log("Occurred at: " + lineInfo);
    postKill("Error processing getESLForm() with " + e);
    return;
  }

  if(!isAmazon) {
    try {
      getSheet(); 
    } catch(e) {
      let stack = e.stack.split("\n");
      let lineInfo = stack.length > 1 ? stack[1] : "No line info";
      Logger.log("Error in getSheet(): " + e.message);
      Logger.log("Occurred at: " + lineInfo);
      postKill("Error processing getSheet() with " + e);
      return;
    }
  } else {
    try {
      discordTag = amazonBuyerDiscordTag;
      generateAmazonLink();
    } catch(e) {
      let stack = e.stack.split("\n");
      let lineInfo = stack.length > 1 ? stack[1] : "No line info";
      Logger.log("Error in generateAmazonLink(): " + e.message);
      Logger.log("Occurred at: " + lineInfo);
      postKill("Error processing generateAmazonLink() with " + e);
      return;
    }
  }

  try {
    editMasterSheet();
  } catch(e) {
    let stack = e.stack.split("\n");
    let lineInfo = stack.length > 1 ? stack[1] : "No line info";
    Logger.log("Error in editMasterSheet(): " + e.message);
    Logger.log("Occurred at: " + lineInfo);
    postKill("Error processing editMasterSheet() with " + e);
    return;
  }

  try{
    postEmbed();
  } catch(e) {
    let stack = e.stack.split("\n");
    let lineInfo = stack.length > 1 ? stack[1] : "No line info";
    Logger.log("Error in postEmbed(): " + e.message);
    Logger.log("Occurred at: " + lineInfo);
    postKill("Error processing postEmbed() with " + e);
    return;
  }

}