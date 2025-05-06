/**
 * edit ESL link based on global variables
 */

function setESLForm() {
  let nonAmazonESLLink = "https://forms.office.com/Pages/ResponsePage.aspx?id=peLXMdi9TkGel76pmOvf4dv_rhRZro1NgZGCgeaT1khUQ1lGWExQQkRWUDdTQ0lWNDRYODhBMDFYRCQlQCN0PWcu&r9e6138dd5c89450f8f6a8b8517d221b4=%22IEEE%20RAS%22&r8206cbea8fb9420a911c3c32b2e347ab=email&r726134260b1a4500a984a68d8e1b6343=description&r777cfa813cbd4e149bbf9d3a345aa2e7=reasonforrequest&r169b319bda994bd38a63c8328d1d1df7=%22date%22&r77dadc83ec6748899ba90dde68fe0559=vendor&ra0ab01457ca64323a9a3f0816f65a215=amount&r52849d4ae22d4866b73e016d54b3b0c7=%22No%22&r8fe6bf74b01940ac97a3c22fd528702b=%22Online%20purchase%22&r4674b1efa17640b59162c5e01ed9f4ac=%22Yes%22&r164a9d37d68e4a6b9df52a237a14680d=specialNotes&"
  let amazonESLLink = "https://forms.office.com/Pages/ResponsePage.aspx?id=peLXMdi9TkGel76pmOvf4dv_rhRZro1NgZGCgeaT1khUQ1lGWExQQkRWUDdTQ0lWNDRYODhBMDFYRCQlQCN0PWcu&r9e6138dd5c89450f8f6a8b8517d221b4=%22IEEE%20RAS%22&r8206cbea8fb9420a911c3c32b2e347ab=email&r726134260b1a4500a984a68d8e1b6343=description&r777cfa813cbd4e149bbf9d3a345aa2e7=reasonforrequest&r169b319bda994bd38a63c8328d1d1df7=%22date%22&r77dadc83ec6748899ba90dde68fe0559=Amazon&ra0ab01457ca64323a9a3f0816f65a215=amount&r52849d4ae22d4866b73e016d54b3b0c7=%22No%22&r8fe6bf74b01940ac97a3c22fd528702b=%22Amazon%20Business%20Prime%20%28ABP%29%22&rb0427c1513c043549fffb36b6731853e=%22Yes%22&ra682f5699f444b99abf53646d0c49849=amazonBuyerName&r6f7bd249468a48608292d56192d9f564=amazonOrderNumber&rf07274b33cdb4ead9585cb03f6a7faa4=%22No%22&r4674b1efa17640b59162c5e01ed9f4ac=%22Yes%22&r164a9d37d68e4a6b9df52a237a14680d=specialNotes&"
  let foodESLLink = "https://forms.office.com/Pages/ResponsePage.aspx?id=peLXMdi9TkGel76pmOvf4dv_rhRZro1NgZGCgeaT1khUQ1lGWExQQkRWUDdTQ0lWNDRYODhBMDFYRCQlQCN0PWcu&r9e6138dd5c89450f8f6a8b8517d221b4=IEEE%20RAS&r8206cbea8fb9420a911c3c32b2e347ab=email&r726134260b1a4500a984a68d8e1b6343=description&r777cfa813cbd4e149bbf9d3a345aa2e7=reasonforrequest&r169b319bda994bd38a63c8328d1d1df7=date&r77dadc83ec6748899ba90dde68fe0559=vendor&ra0ab01457ca64323a9a3f0816f65a215=amount&r52849d4ae22d4866b73e016d54b3b0c7=No&r8fe6bf74b01940ac97a3c22fd528702b=%22Food%20card%C2%A0%22&rf04ab58720f840e7a53ec6d60a082a02=Invoice&r021d2fe6feb4463f851041674a449970=checkOutDate&raa727c0d17be499689846698b28060e4=RTimeBlock&rb6936920a2ab46a19e740eff73ef11e8=pickupTime&r929e7e97825a4c64aa6abcf715621683=fullName&r6fc9f8e005124f60b6d48f1ee0346d27=eid&r5ffd423f21784066a71a145ca978ae84=personalEmail&rf6a7c10e0da74bbbae37ebc8c8f13acb=Understood&r237e4e877de44a3597b00805873d3d4e=No&rf0294efe043d426381e5fbb789fed41c=restaurantAddress&rcbe5ba832f974c6e8c9814d14aad0470=restaurantPhone&r164a9d37d68e4a6b9df52a237a14680d=specialNotes&"

                      
  let today = new Date();
  today.setDate(today.getDate() + 7); // 7 days out from today
  let formattedDate = today.getFullYear() + '-' + // YYYY-MM-DD (acceptable format for URL)
                      (today.getMonth() + 1).toString().padStart(2, '0') + '-' +
                      today.getDate().toString().padStart(2, '0');

  let descRes = "";
  let reasonRes = "";
  if(mode === "materials") {
    let prompt = "return me a short summary where each of the following items is summarized in three words. separate each item with a comma. do not describe the item. only list the names. skip the item if a similar item already exists: "
    for(i = 0; i < itemsOrdered; i++) {
      prompt += nameArr[i] + " ";
    }
    descRes = testGemini(prompt);

    reasonRes = committeeName === "General" 
      ? "General materials for org" 
      : "Materials for " + committeeName + " committee project";

    if(isAmazon) {
      amazonESLLink = amazonESLLink.replace("amazonBuyerName", amazonBuyerName);
      amazonESLLink = amazonESLLink.replace("amazonOrderNumber", ""); // fill manually in form
      amazonESLLink = amazonESLLink.replace("amount", totalPrice);
      eslLink = amazonESLLink;
    } 
    else {
      nonAmazonESLLink = nonAmazonESLLink.replace("vendor", vendorName);
      nonAmazonESLLink = nonAmazonESLLink.replace("amount", totalPrice);
      eslLink = nonAmazonESLLink;
    }
    eslLink = eslLink.replace("email", "ut.ieee.ras@gmail.com"); // hardcode email to main ras account
    eslLink = eslLink.replace("date", formattedDate);

    if (specialNotes.trim() === "") {
          specialNotes = "N/A";
    }
    else {
          specialNotes = specialNotes.replace(/%/g, " percent"); // Replace % with "percent"
    }  
    eslLink = eslLink.replace("specialNotes", specialNotes);
    eslLink = eslLink.replace("description", descRes); // fill this in manually in form
    eslLink = eslLink.replace("reasonforrequest", reasonRes); // fill this in manually in form 

  }
  else if(mode === "food") {

    eslLink = foodESLLink;
    eslLink = eslLink.replace("email", "ut.ieee.ras@gmail.com"); // hardcode email to main ras account
    eslLink = eslLink.replace("description", foodType); 
    eslLink = eslLink.replace("reasonforrequest", reqReason); 
    eslLink = eslLink.replace("vendor", vendorName); 
    eslLink = eslLink.replace("amount", totalPrice); 
    eslLink = eslLink.replace("checkOutDate", eventDate); 
    eslLink = eslLink.replace("RTimeBlock", timeBlock); 
    eslLink = eslLink.replace("pickupTime", specTime); 
    eslLink = eslLink.replace("fullName", personName); 
    eslLink = eslLink.replace("eid", personEid); 
    eslLink = eslLink.replace("personalEmail", personEmail); 
    eslLink = eslLink.replace("restaurantAddress", restAddy); 
    eslLink = eslLink.replace("restaurantPhone", restPhone); 
    eslLink = eslLink.replace("specialNotes", specialNotes); 

    
  }

  // eslLink = encodeURIComponent(eslLink); // idk why but the link exploded with this. dont care enough to investigate when we alr have working solution below
  eslLink = eslLink.replace(/ /g, "%20"); // replace ALL spaces with %20   
  eslLink = eslLink.replace(/,/g, "%2C"); // replace ALL commas with %2C
  eslLink = eslLink.replace(/,/g, "%28"); // replace ALL ( with %28
  eslLink = eslLink.replace(/,/g, "%29"); // replace ALL ) with %29
  eslLink = eslLink.replace(/[\*\r\n]+/g, ''); //remove ALL instances of *, carriage returns, newlines
}


