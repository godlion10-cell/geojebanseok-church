const fs = require('fs');
const path = require('path');

async function testAnalysis() {
  const imagePath = 'C:\\Users\\taeha\\.gemini\\antigravity\\brain\\da22fd76-392b-45d2-b9e6-43b128600bbe\\media__1775476087350.jpg';
  const apiKey = 'AIzaSyDqw2PCvdi087zo5OGszQT8YzFsYCKYDqo';
  
  const base64Image = fs.readFileSync(imagePath).toString('base64');
  
  const prompt = `교회 주보 이미지입니다. 내용을 분석해서 NEWS 카테고리로 제목과 내용을 JSON 형식으로 추출해주세요.`;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: 'image/jpeg', data: base64Image } }
        ]
      }]
    })
  });

  const data = await res.json();
  console.log('--- API response ---');
  console.log(JSON.stringify(data, null, 2));
}

testAnalysis().catch(console.error);
