const fs = require('fs');
const path = require('path');

async function testAnalysis() {
  const imagePath = 'C:\\Users\\taeha\\.gemini\\antigravity\\brain\\da22fd76-392b-45d2-b9e6-43b128600bbe\\media__1775476087350.jpg';
  const apiKey = 'AIzaSyDqw2PCvdi087zo5OGszQT8YzFsYCKYDqo';
  const base64Image = fs.readFileSync(imagePath).toString('base64');
  
  // Very assertive prompt
  const prompt = "이 이미지는 교회 주보의 공지사항 텍스트 이미지입니다. 5번에서 8번 항목과 목사님 일정이 적혀 있습니다. 이 텍스트들을 모두 읽어서 { \"title\": \"제목\", \"content\": \"내용\" } 형태의 JSON으로 정밀하게 추출해 주세요.";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;
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
    console.log('--- 분석 성공 ---');
    console.log(text);
  } else {
    console.log('Error:', JSON.stringify(data, null, 2));
  }
}
testAnalysis().catch(console.error);
