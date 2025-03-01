/**
 *  reads answers from Google Form and edits global variables accordingly
 */

function parseForm(e) {
  const response = e.response.getItemResponses();

  for (const responseAnswer of response) { // for loop that iterates through each question and parses data. Only iterates through questions with responses
    const question = responseAnswer.getItem().getTitle();
    const answer = responseAnswer.getResponse();
    // let parts = [];

    // try {
    //     parts = answer.match(/[\s\S]{1,1024}/g) || [];
    // } catch (e) {
    //     parts = answer;
    // }

    if (!answer) {
        continue;
    }
    // for (const [index, part] of Object.entries(parts)) {
    //     if (index == 0) {
    //         items.push({
    //             "name": question,
    //             "value": part,
    //             "inline": false
    //         });
    //     } else {
    //         items.push({ 
    //             "name": question.concat(" (cont.)"),
    //             "value": part,
    //             "inline": false
    //         });
    //     }
    // }

    if(question.includes("Sheet Upload")) {
      hasSpreadsheet = true;
      inputSheetID = answer; // returns sheet id in an array (im assuming there would be multiple array elements if there were multiple files)
      inputSheetID = inputSheetID[0]; // get string
      return; // break because we dont care about the rest of the form values anymore
    }

    // parse item name
    if(question.includes("Name")) {
      nameArr.push(answer);
      itemsOrdered++;
    }
    // parse links
    if(question.includes("Link")) {
      linksArr.push(answer);
    }

    // parse item price
    if(question.includes("Price")) {
      priceArr.push(answer);
    }

    // parse item quantity
    if(question.includes("Quantity")) {
      quantityArr.push(answer);
    }

    // parse item description (don't push to discord)
    if(question.includes("Description")) {
      descriptionArr.push(answer);
    }

    // parse shipping cost
    if(question.includes("Total Shipping")) {
      shipping = answer;
    }
    if(question.includes("Shipping Type")) {
      shippingType = answer;
    }
    
    if(question.includes("Email")) {
      email = answer;
    }

    if(question.includes("Special Notes?")) {
      specialNotes = answer;
    }

    if (question.includes("Vendor")) {
      vendorName = answer;
      if(answer === "Amazon") {
        isAmazon = true;
      }
    }

    if (question.includes("Committee")) {
      thumbNailUrl = "https://i.imgur.com/jvF3FoH.jpg";  // default
      committeeName = "General";
      switch(answer) {
        case "VEXU":
          thumbNailUrl = "https://i.imgur.com/2vwgZHO.jpg";
          committeeName = "VEXU";
          break;
        case "RoboMaster":
          thumbNailUrl = "https://i.imgur.com/4UEoyMs.jpg";
          committeeName = "RoboMaster";
          break;
        case "Demobots":
          thumbNailUrl = "https://i.imgur.com/nrR07HS.jpg";
          committeeName = "Demobots";
          break;
        case "IGVC":
          thumbNailUrl = "https://i.imgur.com/M5TQiDf.jpg";
          committeeName = "IGVC";
          break;
        case "Robotathon":
          thumbNailUrl = "https://i.imgur.com/XHbsPvd.jpg";
          committeeName = "Robotathon";
          break;
      }
    }
  } // end for loop that iterates through form questions

  // begin stuff that runs ONCE ===============================================

  for(let i = 0; i < itemsOrdered; i++) {
    totalPrice += (parseFloat(priceArr[i]) * parseInt(quantityArr[i]));
    // Logger.log("line 116 GoogleForm.gs - index " + i + " with priceArr[i]: " + priceArr[i] + " and quantityArr[i] as :" + quantityArr[i] + " and totalPrice as " + totalPrice);
  }
  totalPrice += parseFloat(shipping);

  if (totalPrice > 1500) { // "easter egg" or wtv
    footerUrl = "https://i.imgur.com/1kqpus1.jpg"
    footerText = "holy moly that's a lot of money"
  }

  if (Math.random() > 0.95 && Math.random() > 0.95) { // more easter egg yay yipee
    thumbNailUrl = "https://www.crownbio.com/hubfs/ras-signaling-pathways-thumb.jpg";
  }

}