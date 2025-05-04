// determine which sheet to read and what paperwork to spit out

function parseForm(event) {
  const response = event.response.getItemResponses();

  for (const responseAnswer of response) { 
    const answer = responseAnswer.getResponse();

    if(answer.includes("Materials Order")) {
      mode = "materials";
    }
    else if(answer.includes("Food Order")) {
      mode = "food";
    }
    else if(answer.includes("Update Config")) {
      mode = "config";
    }
  }
}