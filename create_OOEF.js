async function createOOEF() {

  let eventPurp = reqReason;

  let prompt = `How does ${eventPurp} benefit the UT Austin campus? For reference, the Robotics and Automation Society (RAS) is a student led robotics org that allows anyone of all majors to learn about robotics. Please give a one sentence response.`;
  let benefit = testGemini(prompt);

  let ooefData = {
    values: [
      // { "name": "Document ID", "value": "sample update text1" },
      // { "name": "form must accompany the payment voucher for processing within 30 days of the occasion", "value": "sample update text2" },
      { "name": "undefined", "value": `${personName}` }, 
      // { "name": "Form prepared by", "value": `${}` },
      { "name": "Location Place", "value": `${eventLoc}` },
      { "name": "payment voucher", "value": `${eventDate}` },
      // { "name": "Name of Participants 1", "value": `${}` },
      // { "name": "Titles 1", "value": `${}` },
      // { "name": "Affiliations 1", "value": `${}` },
      { "name": "Text2", "value": `${attendCount} undergraduate engineering students`}, 
      { "name": "Text3", "value": `${reqReason}` }, //purpose of event
      { "name": "Text4", "value": `${benefit}` }, // benefit to UT
      { "name": "Estimated Cost", "value": `${estCost}` },
      { "name": "Actual Cost", "value": `${actCost}` },
      { "name": "Average Cost per Person", "value": `${totalPrice/attendCount}` }
    ]
  };
  
  const today = new Date();
  today.setDate(today.getDate() + 7); // 7 days out from today
  formattedDate = today.getFullYear() + '-' + // YYYY-MM-DD (acceptable format for URL)
                      (today.getMonth() + 1).toString().padStart(2, '0') + '-' +
                      today.getDate().toString().padStart(2, '0');

  const fileId = properties['OOEF_FILE_ID'];
  const folderId = properties['OOEF_FOLDER_ID'];

  const blob = DriveApp.getFileById(fileId).getBlob();
  const folder = DriveApp.getFolderById(folderId);

  const PDFA = PDFApp.setPDFBlob(blob);
  const newBlob = await PDFA.setValuesToPDFForm(ooefData); // wait for async task

  const renamedBlob = newBlob.setName(`${vendorName} - ${formattedDate}`);
  const file = folder.createFile(renamedBlob);
  newOOEFLink = file.getUrl();

  Logger.log(`Created OOEF form with name ${file.getName()} and link ${newOOEFLink}`);
  console.log("Final link: " + newOOEFLink);
}