// GLOBAL VARIABLES
let amazonBuyerName = "Annie Vu"; // for Amazon ESL form
let amazonBuyerDiscordTag = "<@365619835939455005>"; // Annie Vu 
let discordTag = "<@533956992272695297>" ; // default ping recipient
// let discordTag = "test discord tag" ; // ping nobody
let thumbNailUrl = "https://i.imgur.com/jvF3FoH.jpg";  // default
let footerUrl = ""; // required for Discord embed's footer
let footerText = ""; // bottom text of embed
let newSheetUrl = "";
let email = "N/A"; // for notification to form submitter. NO LONGER IN USE not gona delete for now bc might break smth and idc enough to go hunting for email references
let committeeName = "";
let fundingSource = "";
let vendorName = "";
let specialNotes = "N/A";
let shippingType = "N/A";
let itemsOrdered = 0;
let shipping = 0;
let totalPrice = 0;
let isPosting = false; // boolean flag to determine if should post to Discord
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
const randomColor = Math.floor(Math.random() * 0xFFFFFF);
const orderID = randomColor;

const properties = PropertiesService.getScriptProperties().getProperties(); // loads properties map with values defined in project properties (Settings > scroll down)

function handleError(e, failName) {
    let stack = e.stack.split("\n");
    let lineInfo = stack.length > 1 ? stack[1] : "No line info";
    Logger.log(`Error in ${failName}` + e.message);
    Logger.log("Occurred at: " + lineInfo);
    postKill(`Error processing ${failName} with ${e}`);
    return;
}


function mainOnSubmit(e) {

  try {
    readSheet();
  } catch(e) {
    handleError(e, "readSheet()");
    return;
  }

  try{
    eslLinkRes = getESLForm();
  } catch(e) {
    handleError(e, "getESLForm()");
    return;
  }

  if(!isAmazon) {
    try {
      getSheet();  // makes formatted sheet for ESL submission
    } catch(e) {
      handleError(e, "getSheet()");
      return;
    }
  } else {
    try {
      discordTag = amazonBuyerDiscordTag;
      generateAmazonLink();
    } catch(e) {
      handleError(e, "generateAmazonLink()");
      return;
    }
  }

  try {
    editMasterSheet();
  } catch(e) {
    handleError(e, "editMasterSheet()");
    return;
  }

  try{
    if(isPosting) { // checkbox toggle in input order sheet
      postEmbed();
    }
    else { // feedback for non-purchase logging
      postSmallEmbed(`Successfully wrote ${itemsOrdered} items from ${vendorName} to ${committeeName}'s sheets for ${fundingSource}!`)
    }
  } catch(e) {
    handleError(e, "postEmbed()");
    return;
  }
}