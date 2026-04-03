'use server';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY가 .env에 설정되지 않았습니다. https://aistudio.google.com/app/apikey 에서 발급받으세요.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';
    const isVideo = mimeType.startsWith('video/');

    const prompt = `당신은 한국 교회 웹사이트 관리 AI 어시스턴트입니다.
첨부된 ${isVideo ? '영상' : '이미지'}을 분석하여 교회 홈페이지 콘텐츠로 등록할 수 있도록 아래 JSON 형식으로 응답하세요.

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

    const geminiBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64,
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
      }
    };

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', errText);
      return NextResponse.json(
        { error: `AI 분석 실패 (${geminiRes.status}): API 키를 확인해주세요.` },
        { status: 500 }
      );
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // JSON 추출 (마크다운 코드블록 안에 있을 수 있음)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'AI 응답에서 JSON을 추출하지 못했습니다.', raw: rawText },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // 파일도 서버에 저장
    const { writeFile, mkdir } = await import('fs/promises');
    const { join } = await import('path');
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const filename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, Buffer.from(bytes));

    return NextResponse.json({
      success: true,
      analysis: parsed,
      uploadedFile: `/uploads/${filename}`,
      fileName: file.name,
    });

  } catch (error: any) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: error.message || '분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
