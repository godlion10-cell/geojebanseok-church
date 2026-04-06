const fs = require('fs');
const path = require('path');

async function testAnalysis() {
  const imagePath = 'C:\\Users\\taeha\\.gemini\\antigravity\\brain\\da22fd76-392b-45d2-b9e6-43b128600bbe\\media__1775476087350.jpg';
  const apiKey = 'AIzaSyDqw2PCvdi087zo5OGszQT8YzFsYCKYDqo'; // Using the user's Gemini key
  
  const base64Image = fs.readFileSync(imagePath).toString('base64');
  
  const prompt = `당신은 한국 교회 웹사이트 관리 AI 어시스턴트입니다.
첨부된 이미지를 분석하여 교회 홈페이지 콘텐츠로 등록할 수 있도록 아래 JSON 형식으로 응답하세요.

분석 규칙:
1. 주보(교회 소식지) 사진이면 → category: "NEWS", 제목과 내용을 추출
2. 설교/예배 영상이면 → category: "SERMON", 설교 제목과 설교자 이름 추출
3. 예배 시간표 사진이면 → category: "SCHEDULE", 각 예배의 이름/시간/장소/담당자 추출
4. 교회 행사/활동 사진이면 → category: "NEWS", 행사명과 설명 작성
5. 기타 이미지면 → category: "NEWS", 적절한 제목과 설명 작성

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "category": "NEWS" | "SERMON" | "SCHEDULE",
  "title": "제목",
  "content": "상세 내용 (줄바꿈은 \\n 사용)",
  "subcategory": "세부 카테고리 (예: 주일오전 설교, 수요예배 말씀, 교회 행사 등)",
  "schedules": [
    {"title": "예배명", "time": "시간", "place": "장소", "officer": "담당자"}
  ]
}

schedules 배열은 category가 "SCHEDULE"일 때만 채우세요.
이미지에서 텍스트가 보이면 최대한 정확하게 추출하세요.`;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const res = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: 'image/jpeg', data: base64Image } }
        ]
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
    })
  });

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  console.log('--- raw response ---');
  console.log(text);
  
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    fs.writeFileSync('test_analysis_result.json', jsonMatch[0]);
    console.log('\n--- parsed result ---');
    console.log(JSON.stringify(JSON.parse(jsonMatch[0]), null, 2));
  } else {
    console.log('No JSON found in response');
  }
}

testAnalysis().catch(console.error);
