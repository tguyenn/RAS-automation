/**
 *  post embed to discord
 */

let iPAddress = properties['AWS_IP_ADDRESS'];
const DISCORD_POST_URL = `http://${iPAddress}:3000/send-message`;

let items = []; // not actual purchased items, this is filled with fields that get published in discord embed <- tbh i think this is used elsewhere but im not paid enough to clean up
let embed1 = [];
let embed2 = [];

let options; // text customizations for embed

function postEmbed() { 
  preparePayload();
  response = UrlFetchApp.fetch(DISCORD_POST_URL, options);
  console.log("posted embeds!");
}

// returns array of arrays of length 25
function splitIntoChunks(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

function preparePayload() {
  let payloadContentString = "";

  if (fundingSource !== "HCB Committee Funds") {
    payloadContentString = "\n[Prefilled ESL Form](" + eslLink + ")\n";
  }
  if (mode === "materials") {
    if (isAmazon) {
      payloadContentString += "[Generated Amazon Cart](" + amazonLink + ")";
    } else {
      payloadContentString += "[Generated Spreadsheet Link](" + newSheetUrl + ")";
    }
  } else if (mode === "food") {
    payloadContentString += "[Generated OOEF PDF Link](" + newOOEFLink + ")";
  }

  // dump all fields into a single embed and split up to meet discord's 25 field per embed requirement
  const fields = [
    { "name": "Committee", "value": committeeName, "inline": false },
    { "name": "Special Notes", "value": specialNotes, "inline": false },
    { "name": "Funding Source", "value": fundingSource, "inline": false },
    { "name": "Vendor", "value": vendorName, "inline": false },
    { "name": "Shipping", "value": `$${parseFloat(shipping).toFixed(2)}`, "inline": false },
    { "name": "Shipping Type", "value": shippingType, "inline": false },
    ...nameArr.map((name, index) => ({
      "name": `__${quantityArr[index]}x__ ${name}`,
      "value": `[Link](${linksArr[index]}) - $${parseFloat(priceArr[index]).toFixed(2)}`,
      "inline": false
    })),
    { "name": "Total Price", "value": `$${parseFloat(totalPrice.toFixed(2))}`, "inline": false }
  ];

  // Split fields into chunks of 25
  const fieldChunks = splitIntoChunks(fields, 25);

  // Generate embeds dynamically
  const embeds = fieldChunks.map((chunk, index) => ({
    "title": index === 0 ? `${itemsOrdered} unique links!` : `Continued (${index + 1})`,
    "color": randomColor,
    "fields": chunk,
    "footer": index === fieldChunks.length - 1 ? { "text": footerText, ...(footerUrl ? { "icon_url": footerUrl } : {}) } : undefined,
    "thumbnail": index === 0 ? { "url": thumbNailUrl } : {}, // only have thumbnail for first embed
    "timestamp": index === fieldChunks.length - 1 ? new Date().toISOString() : "" // only timestamp last embed
  }));

  // Prepare the options payload
  options = {
    "method": "post",
    "headers": {
      "Content-Type": "application/json",
    },
    "payload": JSON.stringify({
      "content": discordTag + " " + payloadContentString + "\n" + specialErrorMessage,
      "embeds": embeds
    })
  };
}

function postSmallEmbed(message) { 
  notificationWebhookUrl = properties['DISCUSSION_WEBHOOK']
  const options = {
          "method": "post",
          "headers": {
          "Content-Type": "application/json",
          },
    "payload": JSON.stringify({
    "content": "", // this is the unformatted text above the rich embed
    "embeds": [{
      "title": message,
      "color": randomColor,
      "fields": [],
      "timestamp": new Date().toISOString()
      }]
    })
  };
    UrlFetchApp.fetch(notificationWebhookUrl, options);
    return;
}

// posts error message to discord
function postKill(process) { 
  items = []; // clear contents
  DISCORD_WEBHOOK_URL = properties['ORDERS_WEBHOOK']; // if something is wrong with bot, make sure u can post the error embed by using a discord webhook
  Logger.log(`
    postKill JSON debug dump: \n
    specialErrorMessage: ${specialErrorMessage} \n
    footerText: ${footerText} \n
    DISCORD_WEBHOOK_URL: ${DISCORD_WEBHOOK_URL}
  `);

  const options = {
          "method": "post",
          "headers": {
          "Content-Type": "application/json",
           "muteHttpExceptions": true
          },
    "payload": JSON.stringify({
    "content": debugDiscordTag + "\n" + specialErrorMessage, // this is the unformatted text above the rich embed
    "embeds": [{
      "title": `something broke lmao (${process})`,
      "color": randomColor,
      "fields": items,
      "footer": {
        "text": footerText,
        ...(footerUrl ? { "icon_url": footerUrl } : {})
      },
      "timestamp": new Date().toISOString()
      }]
    })
  };

    let response = UrlFetchApp.fetch(DISCORD_WEBHOOK_URL, options); 
    Logger.log("response: " + response);

    return;
}