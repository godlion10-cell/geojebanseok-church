// AI 분석 API Route - Gemini 우선, 실패 시 OpenAI 자동 전환

import { NextRequest, NextResponse } from 'next/server';

// ===== 공통 프롬프트 생성 =====
function buildPrompt(file: File, isVideo: boolean, isPdf: boolean, isDocument: boolean, instruction: string): string {
  let prompt: string;

  if (isDocument && !isPdf) {
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

  return prompt;
}

// ===== Gemini API 호출 =====
async function callGemini(apiKey: string, prompt: string, base64: string, mimeType: string, isImage: boolean, isPdf: boolean, isVideo: boolean, isDocument: boolean): Promise<{ success: boolean; text?: string; rateLimited?: boolean; error?: string }> {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const parts: any[] = [{ text: prompt }];
  if (isImage || isPdf || isVideo) {
    parts.push({ inline_data: { mime_type: mimeType, data: base64 } });
  } else if (isDocument) {
    parts.push({ inline_data: { mime_type: 'application/octet-stream', data: base64 } });
  }

  const res = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Gemini API error:', errText);
    if (res.status === 429 || errText.includes('RESOURCE_EXHAUSTED')) {
      return { success: false, rateLimited: true, error: 'Gemini 할당량 초과' };
    }
    return { success: false, error: `Gemini 에러 (${res.status})` };
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return { success: true, text };
}

// ===== OpenAI API 호출 =====
async function callOpenAI(apiKey: string, prompt: string, base64: string, mimeType: string, isImage: boolean): Promise<{ success: boolean; text?: string; error?: string }> {
  const messages: any[] = [];

  if (isImage) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
      ],
    });
  } else {
    messages.push({
      role: 'user',
      content: prompt,
    });
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.1,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('OpenAI API error:', errText);
    return { success: false, error: `OpenAI 에러 (${res.status})` };
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || '';
  return { success: true, text };
}

// ===== 메인 API Route =====
export async function POST(request: NextRequest) {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!geminiKey && !openaiKey) {
      return NextResponse.json(
        { error: 'AI API 키가 설정되지 않았습니다. GEMINI_API_KEY 또는 OPENAI_API_KEY를 환경변수에 추가해주세요.' },
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

    const isDocument = fileName.endsWith('.hwp') || fileName.endsWith('.hwpx') ||
                       fileName.endsWith('.doc') || fileName.endsWith('.docx') ||
                       fileName.endsWith('.txt') || fileName.endsWith('.rtf');
    const isPdf = fileName.endsWith('.pdf') || mimeType === 'application/pdf';
    const isImage = mimeType.startsWith('image/');

    if (!isImage && !isVideo && !isPdf && !isDocument) {
      if (fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/)) {
        mimeType = 'image/jpeg';
      }
    }
    if (isPdf) mimeType = 'application/pdf';

    const instruction = formData.get('instruction') as string || '';
    const prompt = buildPrompt(file, isVideo, isPdf, isDocument, instruction);

    let rawText = '';
    let usedModel = '';

    // 1️⃣ Gemini 먼저 시도
    if (geminiKey) {
      console.log('🤖 Gemini로 분석 시도...');
      const geminiResult = await callGemini(geminiKey, prompt, base64, mimeType, isImage, isPdf, isVideo, isDocument);

      if (geminiResult.success && geminiResult.text) {
        rawText = geminiResult.text;
        usedModel = 'Gemini';
        console.log('✅ Gemini 분석 성공');
      } else if (geminiResult.rateLimited && openaiKey) {
        // 할당량 초과 → OpenAI로 전환
        console.log('⚠️ Gemini 할당량 초과 → OpenAI로 자동 전환');
        const openaiResult = await callOpenAI(openaiKey, prompt, base64, mimeType, isImage);
        if (openaiResult.success && openaiResult.text) {
          rawText = openaiResult.text;
          usedModel = 'OpenAI (자동 전환)';
          console.log('✅ OpenAI 분석 성공');
        } else {
          return NextResponse.json(
            { error: `AI 분석 실패: ${openaiResult.error}` },
            { status: 500 }
          );
        }
      } else if (geminiResult.rateLimited) {
        return NextResponse.json(
          { error: '⏳ Gemini 할당량 초과. OPENAI_API_KEY를 설정하시면 자동 전환됩니다. 또는 1~2분 후 재시도해주세요.' },
          { status: 429 }
        );
      } else {
        // HWP 파일 관련 Gemini 에러
        if (isDocument && !isPdf) {
          return NextResponse.json({
            success: true,
            analysis: {
              category: 'NEWS',
              title: file.name.replace(/\.[^.]+$/, ''),
              content: 'HWP(한글) 파일은 직접 분석이 어렵습니다.\n\n💡 팁: HWP 파일을 이미지(스크린샷)나 PDF로 변환한 후 업로드하시면 AI가 정확하게 분석할 수 있습니다.',
              subcategory: '문서 파일',
            },
            uploadedFile: '',
            fileName: file.name,
          });
        }

        // OpenAI fallback
        if (openaiKey) {
          console.log('⚠️ Gemini 실패 → OpenAI로 자동 전환');
          const openaiResult = await callOpenAI(openaiKey, prompt, base64, mimeType, isImage);
          if (openaiResult.success && openaiResult.text) {
            rawText = openaiResult.text;
            usedModel = 'OpenAI (자동 전환)';
          } else {
            return NextResponse.json(
              { error: `AI 분석 실패: ${openaiResult.error}` },
              { status: 500 }
            );
          }
        } else {
          return NextResponse.json(
            { error: `Gemini 분석 실패: ${geminiResult.error}. OPENAI_API_KEY를 설정하시면 자동 전환됩니다.` },
            { status: 500 }
          );
        }
      }
    }
    // 2️⃣ Gemini 키 없으면 OpenAI만 사용
    else if (openaiKey) {
      console.log('🤖 OpenAI로 분석 시도...');
      const openaiResult = await callOpenAI(openaiKey, prompt, base64, mimeType, isImage);
      if (openaiResult.success && openaiResult.text) {
        rawText = openaiResult.text;
        usedModel = 'OpenAI';
        console.log('✅ OpenAI 분석 성공');
      } else {
        return NextResponse.json(
          { error: `OpenAI 분석 실패: ${openaiResult.error}` },
          { status: 500 }
        );
      }
    }

    // JSON 추출
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'AI 응답에서 JSON을 추출하지 못했습니다.', raw: rawText },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // 파일 저장 (/tmp 사용 - Vercel은 읽기 전용 파일시스템이므로)
    const { writeFile, mkdir } = await import('fs/promises');
    const { join } = await import('path');
    const uploadDir = join('/tmp', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const filename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, Buffer.from(bytes));

    return NextResponse.json({
      success: true,
      analysis: parsed,
      uploadedFile: `data:${mimeType};base64,${base64}`,
      fileName: file.name,
      model: usedModel,
    });

  } catch (error: any) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: error.message || '분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
