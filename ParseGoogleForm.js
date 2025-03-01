/**
 *  reads answers from Google Form and edits global variables accordingly
 * Note 3/1/2025 - deleted the manual entry through google form
 */

function parseForm(e) {
  const response = e.response.getItemResponses();

  for (const responseAnswer of response) { // for loop that iterates through each question and parses data. Only iterates through questions with responses
    const question = responseAnswer.getItem().getTitle();
    const answer = responseAnswer.getResponse();

    if(question.includes("Sheet Upload")) {
      hasSpreadsheet = true;
      inputSheetID = answer; // returns sheet id in an array (im assuming there would be multiple array elements if there were multiple files)
      inputSheetID = inputSheetID[0]; // get string
    }
  }
  
}