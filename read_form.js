// determine which sheet to read and what paperwork to spit out

function readForm(event) {
  const response = event.response.getItemResponses()[0];

  const answer = response.getResponse();

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