// GLOBAL VARIABLES

// form data
let fundingSource = "";
let committeeName = "";
let vendorName = "";
let specialNotes = "N/A";
let itemsOrdered = 0;
let shipping = 0;
let shippingType = "N/A";
let totalPrice = 0;
let nameArr = [];
let quantityArr = [];
let linksArr = [];
let priceArr = [];
let descriptionArr = [];

// output information
let amazonLink = "";
let eslLink = "";
let newSheetUrl = "";
let newOOEFLink = "";
let specialErrorMessage = ""; // normal message text outside (at top) of embed 

let amazonBuyerName = "Annie Vu"; // for Amazon ESL form
// let amazonBuyerDiscordTag = "<@365619835939455005>"; // Annie Vu 
// let discordTag = "<@533956992272695297>" ; // default ping recipient (colin)
let amazonBuyerDiscordTag = "amazon_test_discord_tag"; // ping nobody amazon 
let discordTag = "normal_test_discord_tag" ; // ping nobody normal   
let debugDiscordTag = "<@339824792092016640>"; // toby
const randomColor = Math.floor(Math.random() * 0xFFFFFF);
const orderID = randomColor;

// embed/script data
let thumbNailUrl = "";
let footerUrl = ""; // required for Discord embed's footer
let footerText = `${orderID}`; // bottom text of embed
let mode = "";
let isPosting = false; // boolean flag to determine if should post to Discord orders channel
let isAmazon = false;

const properties = PropertiesService.getScriptProperties().getProperties(); // loads properties map with values defined in project properties (Settings > scroll down)


function handleError(e, failName) {
    let stack = e.stack.split("\n");
    let lineInfo = stack.length > 1 ? stack[1] : "No line info";
    Logger.log(`Error in ${failName}` + e.message);
    Logger.log("Occurred at: " + lineInfo);
    postKill(`Error processing ${failName} with ${e}`);
    return;
}


async function mainOnSubmit(event) {

  try {
    parseForm(event);
  } catch(e) {
    handleError(e, "parseForm()");
    return;
  }

  try {
    if(mode === "materials") {
      console.log("materials");
      readNormalSheet();
    }
    else if(mode === "food") {
      readFoodSheet();
      console.log("food");
    }
    else if(mode === "config") {
      console.log("config");
      readConfigSheet();
      updateConfig();
      return; // stop processing after updating config throughout system
    }
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

  if(mode === "materials") {
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
  }
  else if(mode === "food") {
    await createOOEF();
    console.log("lol" + newOOEFLink);
  }


  try {
    editMasterSheet();
  } catch(e) {
    handleError(e, "editMasterSheet()");
    return;
  }

  try{
    if(isPosting) { // this signal is a checkbox toggle in the input order sheet
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