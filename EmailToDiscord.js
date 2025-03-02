/**
 * NOT TIED TO OTHER SCRIPT IN THIS SCRIPT PROJECT
 *  periodically reads ut.ieee.ras@gmail.com inbox for incoming order notifications and posts notification to orders discussion channel
 */


function checkAndPrintEmailsWithLabel() {
  const labelName = "Package Script Check Flag (should be automatically removed)";
  const label = GmailApp.getUserLabelByName(labelName);
  
  if (!label) { // if someone deletes the label in email
    Logger.log(`Label '${labelName}' not found.`);
    return;
  }

  const threads = label.getThreads();
  if (threads.length === 0) {
    Logger.log(`No emails found with label '${labelName}'.`);
    return;
  }

  Logger.log(`Found ${threads.length} threads with label '${labelName}':\n`);
  threads.forEach(thread => {
    const messages = thread.getMessages();
    messages.forEach((message) => {
      if(message.getPlainBody().includes("package(s)")) {
        console.log("found package email");
        postSmallEmbed();
      }
    });
    label.removeFromThread(thread);
  });
}


function postSmallEmbed() { 
  notificationWebhookUrl = properties['LIVE_NOTIFICATION_WEBHOOK_URL']
  // notificationWebhookUrl = properties['TEST_NOTIFICATION_WEBHOOK_URL']
  const options = {
          "method": "post",
          "headers": {
          "Content-Type": "application/json",
          },
    "payload": JSON.stringify({
    "content": "", // this is the unformatted text above the rich embed
    "embeds": [{
      "title": `Package Received in ESL Office (EER 2.848)`,
      "color": randomColor,
      "fields": [],
      "timestamp": new Date().toISOString()
      }]
    })
  };

    UrlFetchApp.fetch(notificationWebhookUrl, options);


    return;
}