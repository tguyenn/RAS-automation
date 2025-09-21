// GLOBAL VARIABLES

let properties = PropertiesService.getScriptProperties().getProperties(); // loads properties map with values defined in project properties (Settings > scroll down)

// form data
let fundingSource = "";
let committeeName = "";
let subCommitteeName = "";
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

// discord tags/names
let amazonBuyerDiscordTag = `<@${properties['DISC_AMZ_ORDER_TAG']}>\n`;
let discordTag = `<@${properties['DISC_NON_AMZ_ORDER_TAG']}>\n`;
// let amazonBuyerDiscordTag = "amazon_test_discord_tag\n"; // ping nobody amazon (DEBUG)
// let discordTag = "normal_test_discord_tag\n" ; // ping nobody normal  (DEBUG)
let debugDiscordTag = `<@${properties['DISC_DEBUG_TAG']}>\n`;
let amazonBuyerName = `${properties['AMZ_BUYER_NAME']}\n`; // for Amazon ESL form


const randomColor = Math.floor(Math.random() * 0xFFFFFF);
const orderID = randomColor;

// embed/script data
let footerText = orderID; // bottom text of embed
let thumbNailUrl = "";
let footerUrl = "";
let mode = "";
let isPosting = false; // flag to determine if should post to Discord orders channel
let isAmazon = false;

function handleError(e, failName) {
    let stack = e.stack.split("\n");
    let lineInfo = stack.length > 1 ? stack[1] : "No line info";
    Logger.log(`Error in ${failName}` + e.message);
    Logger.log("Occurred at: " + lineInfo);
    postKill(`Error processing ${failName} with ${e}`);
    return;
}

// async function allows script to wait until OOEF is actually done generating (PDFApp lib function is async for whatever reason, so script would continue execution with an invalid file otherwise)
async function mainOnSubmit(event) {
  try {
    readForm(event);
  } catch(e) {
    handleError(e, "readForm()");
    return;
  }

  try {
    if(mode === "materials") {
      console.log("materials");
      readNormalSheet();
    }
    else if(mode === "food") {
      console.log("food");
      readFoodSheet();
    }
    else if(mode === "config") {
      console.log("config");
      updateConfig();
      return; // stop processing after propagating config updates throughout system
    }
  } catch(e) {
    handleError(e, "readSheet()");
    return;
  } 

  try{
    setESLForm();
  } catch(e) {
    handleError(e, "setESLForm()");
    return;
  }

  if(mode === "materials") {
    if(!isAmazon) {
      try {
        createSheet();  // makes formatted sheet for ESL submission
      } catch(e) {
        handleError(e, "createSheet()");
        return;
      }
    } else {
      try {
        discordTag = amazonBuyerDiscordTag;
        setAmazonLink();
      } catch(e) {
        handleError(e, "setAmazonLink()");
        return;
      }
    }
  }
  else if(mode === "food") {
    await createOOEF();
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
    else { // discord feedback for non-purchase logging
      postSmallEmbed(`Successfully wrote ${itemsOrdered} items from ${vendorName} to ${committeeName}'s sheets for ${fundingSource}!`)
    }
  } catch(e) {
    handleError(e, "postEmbed()");
    return;
  }
}