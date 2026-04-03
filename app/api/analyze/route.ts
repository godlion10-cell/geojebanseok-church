// AI 분석 API Route

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY가 서버에 설정되지 않았습니다. Vercel 환경변수를 확인해주세요.' },
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
    let mimeType = file.type || 'application/octet-stream';
    const isVideo = mimeType.startsWith('video/');
    const fileName = file.name.toLowerCase();

    // HWP, 문서 파일 처리: Gemini는 이미지/PDF만 직접 지원
    // HWP 등 문서는 base64로 전송하되 mime을 application/octet-stream으로
    const isDocument = fileName.endsWith('.hwp') || fileName.endsWith('.hwpx') || 
                       fileName.endsWith('.doc') || fileName.endsWith('.docx') ||
                       fileName.endsWith('.txt') || fileName.endsWith('.rtf');
    const isPdf = fileName.endsWith('.pdf') || mimeType === 'application/pdf';
    const isImage = mimeType.startsWith('image/');

    // 지원 가능한 파일 유형 확인
    if (!isImage && !isVideo && !isPdf && !isDocument) {
      // 확장자로 이미지인지 한번 더 확인
      if (fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/)) {
        mimeType = 'image/jpeg';
      }
    }

    // PDF면 mime 보정
    if (isPdf) {
      mimeType = 'application/pdf';
    }

    const instruction = formData.get('instruction') as string || '';

    let prompt: string;
    
    if (isDocument && !isPdf) {
      // HWP 등 문서 파일: 바이너리를 직접 분석할 수 없으므로 파일명 기반 안내
      prompt = `당신은 한국 교회 웹사이트 관리 AI 어시스턴트입니다.
사용자가 "${file.name}" 파일을 업로드했습니다.
이 파일은 HWP(한글) 또는 문서 파일입니다.

첨부된 데이터에서 가능한 한 텍스트를 추출하여 분석해주세요.
파일명에서 유추할 수 있는 정보: "${file.name}"

분석 규칙:
1. 주보(교회 소식지)면 → category: "NEWS", 제목과 내용을 추출
2. 설교/예배 관련이면 → category: "SERMON", 설교 제목과 설교자 이름 추출
3. 예배 시간표면 → category: "SCHEDULE", 각 예배의 이름/시간/장소/담당자 추출
4. 교회 행사면 → category: "NEWS", 행사명과 설명 작성

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "category": "NEWS" | "SERMON" | "SCHEDULE",
  "title": "제목",
  "content": "상세 내용 (줄바꿈은 \\n 사용)",
  "subcategory": "세부 카테고리",
  "schedules": [],
  "note": "HWP 파일은 이미지로 변환 후 업로드하시면 더 정확한 분석이 가능합니다."
}`;
    } else {
      prompt = `당신은 한국 교회 웹사이트 관리 AI 어시스턴트입니다.
첨부된 ${isVideo ? '영상' : isPdf ? 'PDF 문서' : '이미지'}을 분석하여 교회 홈페이지 콘텐츠로 등록할 수 있도록 아래 JSON 형식으로 응답하세요.

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
    }

    if (instruction) {
      prompt += `\n\n[관리자 추가 지시사항]\n${instruction}\n위 지시사항을 반드시 반영하여 분석 결과를 생성하세요.`;
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // 요청 본문 구성
    const parts: any[] = [{ text: prompt }];
    
    // 이미지/PDF/비디오만 inline_data로 첨부 (HWP는 제외)
    if (isImage || isPdf || isVideo) {
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64,
        }
      });
    } else if (isDocument) {
      // 문서 파일도 시도 - Gemini가 읽을 수 있을 수도 있음
      parts.push({
        inline_data: {
          mime_type: 'application/octet-stream',
          data: base64,
        }
      });
    }

    const geminiBody = {
      contents: [{ parts }],
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
      
      // HWP 파일 관련 에러면 안내 메시지
      if (isDocument && !isPdf) {
        return NextResponse.json({
          success: true,
          analysis: {
            category: 'NEWS',
            title: file.name.replace(/\.[^.]+$/, ''),
            content: 'HWP(한글) 파일은 직접 분석이 어렵습니다.\n\n💡 팁: HWP 파일을 이미지(스크린샷)나 PDF로 변환한 후 업로드하시면 AI가 정확하게 분석할 수 있습니다.',
            subcategory: '문서 파일',
            note: 'HWP 파일은 이미지/PDF로 변환 후 재업로드를 권장합니다.',
          },
          uploadedFile: '',
          fileName: file.name,
        });
      }
      
      // 할당량 초과 에러 (429 또는 RESOURCE_EXHAUSTED)
      if (geminiRes.status === 429 || errText.includes('RESOURCE_EXHAUSTED')) {
        return NextResponse.json(
          { error: '⏳ AI 사용량이 일시적으로 한도에 도달했습니다. 1~2분 후 다시 시도해주세요.' },
          { status: 429 }
        );
      }
      
      // API 키 에러
      if (geminiRes.status === 403 || errText.includes('API_KEY_INVALID')) {
        return NextResponse.json(
          { error: '🔑 AI API 키가 유효하지 않습니다. 관리자에게 문의해주세요.' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: `AI 분석 실패 (${geminiRes.status}): 잠시 후 다시 시도해주세요.` },
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
