let ooefData = {
  values: [
    { "name": "Document ID", "value": "sample update text1" },
    { "name": "form must accompany the payment voucher for processing within 30 days of the occasion", "value": "sample update text2" },
    { "name": "undefined", "value": "sample update text3" },
    { "name": "Form prepared by", "value": "sample update text4" },
    { "name": "Location Place", "value": "sample update text5" },
    { "name": "payment voucher", "value": "sample update text6" },
    { "name": "Name of Participants 1", "value": "sample update text7" },
    { "name": "Titles 1", "value": "sample update text8" },
    { "name": "Affiliations 1", "value": "sample update text9" },
    { "name": "Text2", "value": "sample update text10" },
    { "name": "Text3", "value": "sample update text11" },
    { "name": "Text4", "value": "sample update text12" },
    { "name": "Estimated Cost", "value": "sample update text13" },
    { "name": "Actual Cost", "value": "sample update text14" },
    { "name": "Average Cost per Person", "value": "sample update text15" },
  ]
};


async function createOOEF() {

  const today = new Date();
  today.setDate(today.getDate() + 7); // 7 days out from today
  formattedDate = today.getFullYear() + '-' + // YYYY-MM-DD (acceptable format for URL)
                      (today.getMonth() + 1).toString().padStart(2, '0') + '-' +
                      today.getDate().toString().padStart(2, '0');

  const blob = DriveApp.getFileById("1rA9pn5wmNwB0yvZIVdd0-CDRYbncPMHK").getBlob();
  const folderId = "1XI1To3_-XnbSHawwdNQE-IkKuw6G1zGF";
  const folder = DriveApp.getFolderById(folderId);

  const PDFA = PDFApp.setPDFBlob(blob);
  const newBlob = await PDFA.setValuesToPDFForm(ooefData); // wait for async task

  const renamedBlob = newBlob.setName(`${formattedDate} - ${vendorName}`);
  const file = folder.createFile(renamedBlob);
  newOOEFLink = file.getUrl();

  Logger.log(`Created OOEF form with name ${file.getName()} and link ${newOOEFLink}`);
  console.log("Final link: " + newOOEFLink);
}