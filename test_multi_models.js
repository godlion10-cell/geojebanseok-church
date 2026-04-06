const fs = require('fs');
const path = require('path');

async function testAll() {
  const imagePath = 'C:\\Users\\taeha\\.gemini\\antigravity\\brain\\da22fd76-392b-45d2-b9e6-43b128600bbe\\media__1775476087350.jpg';
  const apiKey = 'AIzaSyDqw2PCvdi087zo5OGszQT8YzFsYCKYDqo';
  const base64Image = fs.readFileSync(imagePath).toString('base64');
  const prompt = "Analyze the church bulletin image and extract text summaries.";

  const models = ['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-pro-vision'];
  
  for (const model of models) {
    console.log(`Trying model: ${model}...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: 'image/jpeg', data: base64Image } }] }]
        })
      });
      const data = await res.json();
      if (data.candidates) {
        console.log(`Success with ${model}`);
        console.log(data.candidates[0].content.parts[0].text);
        return;
      } else {
        console.log(`${model} failed:`, data.error?.message || 'Unknown error');
      }
    } catch (e) {
      console.log(`${model} error:`, e.message);
    }
  }
}
testAll().catch(console.error);
