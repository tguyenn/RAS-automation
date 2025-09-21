itemQuantities = [];
eslLinks = [];

function dequeue(target) {
  let index = itemQuantities.indexOf(target);
  if(index == -1) {
    throw new Error("Could not find item quantity from email uh oh");
  }
  itemQuantities.splice(index, 1);
}

function removeLabel(thread) {
    const humanReadableLabelName = "Amazon Order Parsing Flag (automatically removed)";
    const label = GmailApp.getUserLabelByName(humanReadableLabelName);
    label.removeFromThread(thread);
}

function extractAmazonOrderInfo(emailText) {
  const result = {
    orderNumber: null,
    items: [],
    readItemQuants: [],
    total: null
  };

  // Extract order number
  const orderMatch = emailText.match(/Order #(\d{3}-\d{7}-\d{7})/);
  if (orderMatch) result.orderNumber = orderMatch[1];

  

  // Extract items, prices, and item quantities
  const lines = emailText.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Look for price line
    const priceMatch = line.match(/^\$(\d+\.\d{2})$/);
    if (priceMatch && i > 0) {
      const itemName = lines[i - 1].trim();
      result.items.push({
        name: itemName,
        price: `$${priceMatch[1]}`
      });
    }
    const qtyMatch = line.match(/(\d+)\s*x/i);
    if (qtyMatch) {
      const quantity = parseInt(qtyMatch[1], 10);
      result.readItemQuants.push(quantity);
    }
  }

  // Extract order total
  const totalMatch = emailText.match(/Order Total:\s*\$([\d\.]+)/i);
  if (totalMatch) result.total = `${totalMatch[1]}`;


  // pad result.readItemQuants with 1's corresponding to number of missing quantities
  while(result.readItemQuants.length == undefined || result.readItemQuants.length < result.items.length) {
    result.readItemQuants.push(1); // assume qty is 1 if no number is found
  }
  return result;
}


function getAmazonForms(inItemQuantities) {
  // postSmallEmbed("beginning exeuction for getAmazonForms()"); 
  itemQuantities = inItemQuantities;
  const labelName = "amazon-order-parsing-flag--automatically-removed- ";
  // const threads = GmailApp.search(`label:"${labelName}" newer_than:5m`); // live 
  const threads = GmailApp.search(`label:${labelName}`); // test bc test data doestn have correct timestamp
  if (threads.length == 0) {
    Logger.log(`No emails found with label "${labelName}"`);
    return;
  }

  Logger.log(`Found ${threads.length} threads with label '${labelName}':\n`);
  threads.forEach(thread => {
    const messages = thread.getMessages();
    messages.forEach((message) => {
      let body = message.getPlainBody();
      if(!body.includes("confirmation once your order has been approved")) { // only read from request submission confirmation emails
        removeLabel(thread);
      }

      emailData = extractAmazonOrderInfo(body);

      let orderNumber = emailData.orderNumber;
      let subsetPrice = emailData.total;
      let readItemQuants = emailData.readItemQuants;
      let itemNames = [];
      for(i = 0; i < emailData.items.length; i++) {
        itemNames.push(emailData.items[i].name);
      }
      
      // console.log(orderNumber, subsetPrice, itemNames, readItemQuants);
      let link = generateESLLink(orderNumber, subsetPrice,  itemNames);
      eslLinks.push(link);

      for(i = 0; i < readItemQuants.length; i++) {
        dequeue(readItemQuants[i]); // remove read quantities
        // postSmallEmbed("dequeuing: ", readItemQuants[i]);
      }
      // postSmallEmbed(`Processed order with id: ${orderNumber}`);
      removeLabel(thread);
    });
  });
  if(itemQuantities.length > 0) { // if quantities remaining after looping through all emails, then stop and error
    throw new Error(`Missed some item quantities in Amazon emails: ${itemQuantities}. Irreversible labels were deleted, so now you have to do it by hand L bozo (bother next automation victim to implement in better way)`);
  }
  else {
    return eslLinks;
  }

}


function generateESLLink(orderNumber, subsetPrice, itemNames){
  let eslLink = "https://forms.office.com/Pages/ResponsePage.aspx?id=peLXMdi9TkGel76pmOvf4dv_rhRZro1NgZGCgeaT1khUOTNHNzZQS0xGWTYzS1pQQkgwMFlWNTM1QiQlQCN0PWcu&r9e6138dd5c89450f8f6a8b8517d221b4=%22IEEE%20RAS%22&r8206cbea8fb9420a911c3c32b2e347ab=email&r726134260b1a4500a984a68d8e1b6343=description&r777cfa813cbd4e149bbf9d3a345aa2e7=reasonforrequest&r169b319bda994bd38a63c8328d1d1df7=%22date%22&r77dadc83ec6748899ba90dde68fe0559=Amazon&ra0ab01457ca64323a9a3f0816f65a215=amount&r52849d4ae22d4866b73e016d54b3b0c7=%22No%22&r8fe6bf74b01940ac97a3c22fd528702b=%22Amazon%20Business%20Prime%20%28ABP%29%22&rb0427c1513c043549fffb36b6731853e=%22Yes%22&ra682f5699f444b99abf53646d0c49849=amazonBuyerName&r6f7bd249468a48608292d56192d9f564=amazonOrderNumber&rf07274b33cdb4ead9585cb03f6a7faa4=%22No%22&r4674b1efa17640b59162c5e01ed9f4ac=%22Yes%22";
    

  let prompt = "return me a short summary where each of the following items is summarized in three words. separate each item with a comma. do not describe the item. only list the names. skip the item if a similar item already exists: "
  for(i = 0; i < itemNames.length; i++) {
    prompt += itemNames[i] + " ";
  }
  let descRes = testGemini(prompt);
  // console.log(descRes);
  
  let committeeName = "General";
  let reasonRes = committeeName === "General" 
      ? "General materials for org" 
      : "Materials for " + committeeName + " committee project";

  eslLink = eslLink.replace("amazonBuyerName", amazonBuyerName);
  eslLink = eslLink.replace("amazonOrderNumber", orderNumber); 
  eslLink = eslLink.replace("amount", subsetPrice);
  eslLink = eslLink.replace("email", properties['ORG_EMAIL']);
  eslLink = eslLink.replace("description", descRes); 
  eslLink = eslLink.replace("reasonforrequest", reasonRes); 

  eslLink = eslLink.replace(/ /g, "%20"); // replace ALL spaces with %20   
  eslLink = eslLink.replace(/,/g, "%2C"); // replace ALL commas with %2C
  eslLink = eslLink.replace(/,/g, "%28"); // replace ALL ( with %28
  eslLink = eslLink.replace(/,/g, "%29"); // replace ALL ) with %29
  eslLink = eslLink.replace(/[\*\r\n]+/g, ''); //remove ALL instances of *, carriage returns, newlines

  return eslLink;

}



