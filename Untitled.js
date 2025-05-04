function sendToDiscord() {
let ipaddress = "13.59.233.128"; 
  const url = `http://${ipaddress}:3000/send-message`; // Replace with your EC2 public IP or domain
  const options = {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    payload: JSON.stringify({
      content: "This is a test message from GAS!", // Optional plain text content
      embeds: [
        {
          title: "Test Embed",
          description: "This is a test embed sent from Google Apps Script.",
          color: 16711680, // Red color
          fields: [
            { name: "Field 1", value: "Value 1", inline: true },
            { name: "Field 2", value: "Value 2", inline: true }
          ],
          footer: {
            text: "Footer text here",
            icon_url: "https://example.com/footer-icon.png"
          },
          thumbnail: {
            url: "https://example.com/thumbnail.png"
          },
          timestamp: new Date().toISOString()
        }
      ]
    }),
  };

  const response = UrlFetchApp.fetch(url, options);
  Logger.log(response.getContentText());
}