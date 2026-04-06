const fs = require('fs');
const path = require('path');

async function testAnalysis() {
  const imagePath = 'C:\\Users\\taeha\\.gemini\\antigravity\\brain\\da22fd76-392b-45d2-b9e6-43b128600bbe\\media__1775476087350.jpg';
  const apiKey = 'AIzaSyDqw2PCvdi087zo5OGszQT8YzFsYCKYDqo';
  const base64Image = fs.readFileSync(imagePath).toString('base64');
  const prompt = "주보의 '교회 소식'과 '일정' 부분을 분석해서 제목과 내용을 JSON 형식으로 정밀하게 추출해줘. { \"title\": \"제목\", \"content\": \"내용\" } 형식으로 응답해.";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: 'image/jpeg', data: base64Image } }] }]
    })
  });
  const data = await res.json();
  if (data.candidates) {
    const text = data.candidates[0].content.parts[0].text;
    console.log('--- 분석 결과 ---');
    console.log(text);
  } else {
    console.log('Error:', JSON.stringify(data, null, 2));
  }
}
testAnalysis().catch(console.error);
