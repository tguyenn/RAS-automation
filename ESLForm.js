/**
 * edit and return esl link as string based on global variables
 */

function getESLForm() {
  return replaceForm();
}

function replaceForm() {
  let nonAmazonESLLink = "https://forms.office.com/Pages/ResponsePage.aspx?id=peLXMdi9TkGel76pmOvf4dv_rhRZro1NgZGCgeaT1khUQ1lGWExQQkRWUDdTQ0lWNDRYODhBMDFYRCQlQCN0PWcu&r9e6138dd5c89450f8f6a8b8517d221b4=%22IEEE%20RAS%22&r8206cbea8fb9420a911c3c32b2e347ab=email&r25f1c2f84dcd412b9e33f1153d62816a=phoneNumber&r726134260b1a4500a984a68d8e1b6343=description&r777cfa813cbd4e149bbf9d3a345aa2e7=reasonforrequest&r169b319bda994bd38a63c8328d1d1df7=%22date%22&r77dadc83ec6748899ba90dde68fe0559=vendor&ra0ab01457ca64323a9a3f0816f65a215=amount&r52849d4ae22d4866b73e016d54b3b0c7=%22No%22&r8fe6bf74b01940ac97a3c22fd528702b=%22Online%20purchase%22&r4674b1efa17640b59162c5e01ed9f4ac=%22Yes%22&r164a9d37d68e4a6b9df52a237a14680d=specialNotes&"
  let amazonESLLink = "https://forms.office.com/Pages/ResponsePage.aspx?id=peLXMdi9TkGel76pmOvf4dv_rhRZro1NgZGCgeaT1khUQ1lGWExQQkRWUDdTQ0lWNDRYODhBMDFYRCQlQCN0PWcu&r9e6138dd5c89450f8f6a8b8517d221b4=%22IEEE%20RAS%22&r8206cbea8fb9420a911c3c32b2e347ab=email&r25f1c2f84dcd412b9e33f1153d62816a=phoneNumber&r726134260b1a4500a984a68d8e1b6343=description&r777cfa813cbd4e149bbf9d3a345aa2e7=reasonforrequest&r169b319bda994bd38a63c8328d1d1df7=%22date%22&r77dadc83ec6748899ba90dde68fe0559=Amazon&ra0ab01457ca64323a9a3f0816f65a215=amount&r52849d4ae22d4866b73e016d54b3b0c7=%22No%22&r8fe6bf74b01940ac97a3c22fd528702b=%22Amazon%20Business%20Prime%20%28ABP%29%22&rb0427c1513c043549fffb36b6731853e=%22Yes%22&ra682f5699f444b99abf53646d0c49849=amazonBuyerName&r6f7bd249468a48608292d56192d9f564=amazonOrderNumber&rf07274b33cdb4ead9585cb03f6a7faa4=%22No%22&r4674b1efa17640b59162c5e01ed9f4ac=%22Yes%22&r164a9d37d68e4a6b9df52a237a14680d=specialNotes&"
  
  let today = new Date();
  today.setDate(today.getDate() + 7); // 7 days out from today
  formattedDate = today.getFullYear() + '-' + // YYYY-MM-DD (acceptable format for URL)
                      (today.getMonth() + 1).toString().padStart(2, '0') + '-' +
                      today.getDate().toString().padStart(2, '0');

                      
  let prompt = "return me a short summary where each of the following items is summarized in three words. separate each item with a comma. do not describe the item. only list the names. skip the item if a similar item already exists: "
  for(i = 0; i < itemsOrdered; i++) {
    prompt += nameArr[i] + " ";
  }
  let descRes = "";
  descRes = testGemini(prompt);

  //Experimental Code
  let reasonRes = committeeName === "General" 
    ? "General materials for org" 
    : "Materials for " + committeeName + " committee project";

  if(isAmazon) {
    amazonESLLink = amazonESLLink.replace("amazonBuyerName", amazonBuyerName);
    amazonESLLink = amazonESLLink.replace("amazonOrderNumber", ""); // fill manually in form
    amazonESLLink = amazonESLLink.replace("amount", totalPrice);
    eslLinkRes = amazonESLLink;
  } else {
    nonAmazonESLLink = nonAmazonESLLink.replace("vendor", vendorName);
    nonAmazonESLLink = nonAmazonESLLink.replace("amount", totalPrice);
    eslLinkRes = nonAmazonESLLink;
  }
  // eslLinkRes = eslLinkRes.replace("email", email);
  eslLinkRes = eslLinkRes.replace("email", "ut.ieee.ras@gmail.com"); // hardcode email to main ras account
  eslLinkRes = eslLinkRes.replace("date", formattedDate);

  //Existing Code
  if (specialNotes.trim() === "") {
        specialNotes = "N/A";
    } else {
        specialNotes = specialNotes.replace(/%/g, " percent"); // Replace % with "percent"
    }

  eslLinkRes = eslLinkRes.replace("specialNotes", specialNotes);
  eslLinkRes = eslLinkRes.replace("description", descRes); // fill this in manually in form
  eslLinkRes = eslLinkRes.replace("reasonforrequest", reasonRes); // fill this in manually in form 
  // eslLinkRes = encodeURIComponent(eslLinkRes); // idk why but the link exploded for some reason. dont care enough to investigate when we alr have working solution below
  eslLinkRes = eslLinkRes.replace(/ /g, "%20"); // replace ALL spaces with %20   
  eslLinkRes = eslLinkRes.replace(/,/g, "%2C"); // replace ALL commas with %2C
  
  eslLinkRes = eslLinkRes.replace(/[\*\(\)\r\n]+/g, ''); //remove ALL instances of *, (, ), carriage returns, newlines


  return eslLinkRes;
}


