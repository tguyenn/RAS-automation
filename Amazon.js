/**
 * Generate Amazon cart based on global array of links
 */

function generateAmazonLink() {
  amazonLink = "https://www.amazon.com/gp/aws/cart/add.html?";

  for(let i = 1; i <= itemsOrdered; i++) {
    let asin = extractASIN(linksArr[i-1]);
    if(asin == null) {
      specialNotes = specialNotes + " Could not find ASIN for " + nameArr[i-1] + ": " + linksArr[i-1] + "\n";
    }
    amazonLink = amazonLink + "ASIN." + i + "=" + asin + "&Quantity." + i + "=" +  quantityArr[i-1] + "&";
  }

  amazonLink = amazonLink + "AssociateTag=yourtag";

}

function extractASIN(url) {
  const asinRegex = /(?:dp|gp\/product|ASIN[.=])\/?([A-Z0-9]{10})/i;
  const match = url.match(asinRegex);
  return match ? match[1] : null;
}
