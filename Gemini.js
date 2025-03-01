// Make sure GOOGLE_API_KEY is defined in project properties (left sidebar > Project Settings (gear icon) > scroll all the way down)
// see official guide here: https://codelabs.developers.google.com/codelabs/gemini-workspace#2:~:text=4.%20Call%20the%20Gemini%20API%20from%20Apps%20Script

const geminiApiKey = properties['GOOGLE_API_KEY'];
const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

function testGemini(prompt) {
  // console.log("prompt: " + prompt);
  let output = callGemini(prompt);
  // console.log(output);
  return output;
}

function callGemini(prompt, temperature=0) { // temperature measures how "creative" responses are (wtv that means lmao)
  const payload = {
    "contents": [
      {
        "parts": [
          {
            "text": prompt
          },
        ]
      }
    ], 
    "generationConfig":  {
      "temperature": temperature,
    },
  };

  const options = { 
    'method' : 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
  };

  const response = UrlFetchApp.fetch(geminiEndpoint, options);
  const data = JSON.parse(response);
  const content = data["candidates"][0]["content"]["parts"][0]["text"];
  return content;
}


