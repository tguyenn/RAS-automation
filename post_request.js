function doPost(event) {
  
  const data = JSON.parse(event.postData.contents);
  // postSmallEmbed(JSON.stringify(data));

  // const data = {
  //   // quantities: [1,2,3,4,5,6,7,8,9,10,11,12,13,14],
  //   quantities: [1, 1, 1, 2],
  //   action : "get_amazon_forms",
  // }


  if(data.action == "mark_checks") {
    try{
      markChecks(data.numItems, data.tag, data.committeeName);
    } catch(e) {
      postKill(`Error processing markChecks with ${e}`);
      return;
    }
    return;
  }
  else if(data.action == "get_amazon_forms") {
    try{
      let eslLinks = getAmazonForms(data.quantities);
      return ContentService.createTextOutput(JSON.stringify({
          success: true, 
          data: eslLinks
      })).setMimeType(ContentService.MimeType.JSON);
    }
    catch(e) {
      postKill(`${e}`);
      console.log(e);
      return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: e.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
}
