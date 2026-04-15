import { NextRequest, NextResponse } from 'next/server';

// 디버그용: GET 요청으로 환경변수 확인
export async function GET() {
  return NextResponse.json({
    gemini: !!process.env.GEMINI_API_KEY,
    geminiPrefix: process.env.GEMINI_API_KEY?.substring(0, 8) || 'NOT SET',
  });
}

// ===== 텍스트 분석용 프롬프트 (비용 최저) =====
function buildTextPrompt(text: string, instruction: string): string {
  let prompt = `당신은 한국 교회 웹사이트 관리 AI 어시스턴트입니다.
아래 텍스트를 분석하여 교회 홈페이지 콘텐츠로 등록할 수 있도록 JSON 형식으로 응답하세요.

분석 규칙:
1. 주보/교회 소식(공지사항, 안내, 행사, 새가족 등) → category: "NEWS", 제목과 내용을 추출
2. 설교/예배 관련(설교 제목, 성경 본문, 설교자) → category: "SERMON", 설교 제목과 설교자 이름 추출  
3. 예배 시간표(예배명, 시간, 장소, 담당자) → category: "SCHEDULE", 각 예배의 정보 추출
4. 여러 카테고리가 섞여있으면 가장 많은 비중을 차지하는 카테고리로 분류

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "category": "NEWS" | "SERMON" | "SCHEDULE",
  "title": "제목",
  "content": "상세 내용 (줄바꿈은 \\n 사용)",
  "subcategory": "세부 카테고리",
  "schedules": [
    {"title": "예배명", "time": "시간", "place": "장소", "officer": "담당자"}
  ]
}

schedules 배열은 category가 "SCHEDULE"일 때만 채우세요.

===== 분석할 텍스트 =====
${text}`;

  if (instruction) {
    prompt += `\n\n[관리자 추가 지시사항]\n${instruction}\n위 지시사항을 반드시 반영하여 분석 결과를 생성하세요.`;
  }

  return prompt;
}

// ===== 문서 파일 분석용 프롬프트 =====
function buildDocPrompt(fileName: string, fileText: string, instruction: string): string {
  let prompt = `당신은 한국 교회 웹사이트 관리 AI 어시스턴트입니다.
"${fileName}" 파일에서 추출된 텍스트를 분석하여 교회 홈페이지 콘텐츠로 등록할 수 있도록 JSON 형식으로 응답하세요.

분석 규칙:
1. 주보/교회 소식 → category: "NEWS", 제목과 내용을 추출
2. 설교/예배 관련 → category: "SERMON", 설교 제목과 설교자 추출
3. 예배 시간표 → category: "SCHEDULE", 각 예배의 이름/시간/장소/담당자 추출

반드시 아래 JSON 형식으로만 응답하세요:
{
  "category": "NEWS" | "SERMON" | "SCHEDULE",
  "title": "제목",
  "content": "상세 내용 (줄바꿈은 \\n 사용)",
  "subcategory": "세부 카테고리",
  "schedules": [
    {"title": "예배명", "time": "시간", "place": "장소", "officer": "담당자"}
  ]
}

schedules 배열은 category가 "SCHEDULE"일 때만 채우세요.

===== 문서 내용 =====
${fileText}`;

  if (instruction) {
    prompt += `\n\n[관리자 추가 지시사항]\n${instruction}\n위 지시사항을 반드시 반영하세요.`;
  }

  return prompt;
}

// ===== PDF 분석용 프롬프트 (Gemini PDF 네이티브) =====
function buildPdfPrompt(fileName: string, instruction: string): string {
  let prompt = `당신은 한국 교회 웹사이트 관리 AI 어시스턴트입니다.
첨부된 PDF 문서 "${fileName}"를 분석하여 교회 홈페이지 콘텐츠로 등록할 수 있도록 JSON 형식으로 응답하세요.

분석 규칙:
1. 주보/교회 소식 → category: "NEWS", 제목과 내용을 추출
2. 설교/예배 관련 → category: "SERMON", 설교 제목과 설교자 추출
3. 예배 시간표 → category: "SCHEDULE", 각 예배의 이름/시간/장소/담당자 추출

반드시 아래 JSON 형식으로만 응답하세요:
{
  "category": "NEWS" | "SERMON" | "SCHEDULE",
  "title": "제목",
  "content": "상세 내용 (줄바꿈은 \\n 사용)",
  "subcategory": "세부 카테고리",
  "schedules": [
    {"title": "예배명", "time": "시간", "place": "장소", "officer": "담당자"}
  ]
}

schedules 배열은 category가 "SCHEDULE"일 때만 채우세요.
PDF 내 텍스트를 최대한 정확하게 추출하세요.`;

  if (instruction) {
    prompt += `\n\n[관리자 추가 지시사항]\n${instruction}\n위 지시사항을 반드시 반영하세요.`;
  }

  return prompt;
}

// ===== Gemini API 호출 (텍스트 전용 — 비용 최저) =====
async function callGeminiText(apiKey: string, prompt: string): Promise<{ success: boolean; text?: string; rateLimited?: boolean; error?: string }> {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Gemini API error:', errText);
    if (res.status === 429 || errText.includes('RESOURCE_EXHAUSTED')) {
      return { success: false, rateLimited: true, error: 'Gemini 할당량 초과. 잠시 후 다시 시도해주세요.' };
    }
    return { success: false, error: `Gemini 에러 (${res.status}): ${errText}` };
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return { success: true, text };
}

// ===== Gemini API 호출 (PDF 파일 첨부) =====
async function callGeminiWithPdf(apiKey: string, prompt: string, base64: string): Promise<{ success: boolean; text?: string; rateLimited?: boolean; error?: string }> {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [
        { text: prompt },
        { inlineData: { mimeType: 'application/pdf', data: base64 } },
      ] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Gemini PDF API error:', errText);
    if (res.status === 429 || errText.includes('RESOURCE_EXHAUSTED')) {
      return { success: false, rateLimited: true, error: 'Gemini 할당량 초과. 잠시 후 다시 시도해주세요.' };
    }
    // 프론트엔드에서 정확한 400 에러 원인을 볼 수 있도록 에러 원문을 포함합니다.
    return { success: false, error: `Gemini 에러 (${res.status}): ${errText}` };
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return { success: true, text };
}

// ===== 텍스트 추출 유틸 (바이너리 문서) =====
function extractTextFromBinary(buffer: Buffer, fileName: string): string {
  const lower = fileName.toLowerCase();
  
  // TXT, CSV, RTF — 단순 텍스트
  if (lower.endsWith('.txt') || lower.endsWith('.csv') || lower.endsWith('.rtf')) {
    return buffer.toString('utf-8');
  }

  // HWP/HWPX — 바이너리에서 한글 텍스트 패턴 추출 시도
  if (lower.endsWith('.hwp') || lower.endsWith('.hwpx')) {
    const raw = buffer.toString('utf-8', 0, Math.min(buffer.length, 100000));
    // 한글 유니코드 범위의 텍스트를 추출
    const koreanText = raw.match(/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF\s\d.,!?()a-zA-Z:;\-~@#%&*+=\[\]{}'"\/\\|<>_^`…·•※→←↑↓△▽○●□■◇◆☆★\n\r]+/g);
    if (koreanText) {
      return koreanText.join(' ').replace(/\s+/g, ' ').trim().substring(0, 10000);
    }
    return `[HWP 파일: ${fileName}] — 텍스트 추출이 제한적입니다. PDF로 변환하여 업로드하시면 더 정확합니다.`;
  }

  // DOCX — ZIP 내부의 word/document.xml에서 텍스트 추출
  if (lower.endsWith('.docx')) {
    const raw = buffer.toString('utf-8', 0, Math.min(buffer.length, 200000));
    const textMatches = raw.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
    if (textMatches) {
      return textMatches.map(m => m.replace(/<[^>]+>/g, '')).join(' ').trim().substring(0, 10000);
    }
  }

  // XLSX — XML에서 텍스트 추출
  if (lower.endsWith('.xlsx')) {
    const raw = buffer.toString('utf-8', 0, Math.min(buffer.length, 200000));
    const textMatches = raw.match(/<t[^>]*>([^<]+)<\/t>/g);
    if (textMatches) {
      return textMatches.map(m => m.replace(/<[^>]+>/g, '')).join('\t').trim().substring(0, 10000);
    }
  }

  // XLS, DOC — 레거시 바이너리
  if (lower.endsWith('.xls') || lower.endsWith('.doc')) {
    const raw = buffer.toString('utf-8', 0, Math.min(buffer.length, 100000));
    const koreanText = raw.match(/[\uAC00-\uD7AF\s\d.,!?()a-zA-Z:;\-]+/g);
    if (koreanText) {
      return koreanText.join(' ').replace(/\s+/g, ' ').trim().substring(0, 10000);
    }
  }

  return `[${fileName}] — 텍스트 추출을 시도했으나 내용을 읽을 수 없습니다.`;
}

// ===== AI 호출 (Gemini 전용) =====
async function callAI(prompt: string, geminiKey: string, pdfBase64?: string): Promise<{ rawText: string; model: string }> {
  console.log(`🤖 Gemini API 호출 중... (${pdfBase64 ? 'PDF 첨부' : '텍스트 기반'})`);
  
  const result = pdfBase64
    ? await callGeminiWithPdf(geminiKey, prompt, pdfBase64)
    : await callGeminiText(geminiKey, prompt);

  if (result.success && result.text) {
    console.log('✅ Gemini 분석 성공');
    return { rawText: result.text, model: 'Gemini' };
  }

  if (result.rateLimited) {
    throw new Error('Gemini API 할당량이 초과되었습니다. 잠시 후 다시 시도해주세요.');
  }

  throw new Error(result.error || 'Gemini 분석에 실패했습니다.');
}

// ===== 메인 API Route =====
export async function POST(request: NextRequest) {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY가 설정되지 않았습니다. Vercel 환경 변수를 확인해주세요.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const directText = formData.get('directText') as string | null;
    const instruction = formData.get('instruction') as string || '';

    // 텍스트도 파일도 없으면 에러
    if (!file && !directText?.trim()) {
      return NextResponse.json({ error: '텍스트 또는 파일이 필요합니다.' }, { status: 400 });
    }

    let prompt: string;
    let pdfBase64: string | undefined;

    // ===== 경로 1: 텍스트 직접 입력 (가장 저렴) =====
    if (directText?.trim()) {
      console.log(`[텍스트 분석] 직접 입력 ${directText.trim().length}자`);
      
      // 파일도 함께 있으면 파일에서 텍스트 추출해서 합침
      let combinedText = directText.trim();
      if (file) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = file.name.toLowerCase();
        
        if (fileName.endsWith('.pdf')) {
          // PDF는 Gemini로 직접 분석 → 텍스트와 함께 전달
          pdfBase64 = buffer.toString('base64');
          combinedText += `\n\n[첨부된 PDF 파일: ${file.name}도 함께 분석해주세요]`;
        } else {
          const fileText = extractTextFromBinary(buffer, file.name);
          combinedText += `\n\n===== 첨부 문서 (${file.name}) =====\n${fileText}`;
        }
      }
      
      prompt = buildTextPrompt(combinedText, instruction);

    // ===== 경로 2: PDF 파일 (Gemini PDF 네이티브 분석) =====
    } else if (file && (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf')) {
      console.log(`[PDF 분석] ${file.name}, ${(file.size / 1024).toFixed(1)}KB`);
      const bytes = await file.arrayBuffer();
      pdfBase64 = Buffer.from(bytes).toString('base64');
      prompt = buildPdfPrompt(file.name, instruction);

    // ===== 경로 3: 기타 문서 파일 (텍스트 추출 후 분석) =====
    } else if (file) {
      console.log(`[문서 분석] ${file.name}, ${(file.size / 1024).toFixed(1)}KB`);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const extractedText = extractTextFromBinary(buffer, file.name);
      prompt = buildDocPrompt(file.name, extractedText, instruction);

    } else {
      return NextResponse.json({ error: '입력 데이터가 없습니다.' }, { status: 400 });
    }

    // AI 호출 (Gemini 전용)
    const { rawText, model } = await callAI(prompt, geminiKey, pdfBase64);

    if (!rawText) {
      return NextResponse.json({ error: 'AI 응답이 비어있습니다.' }, { status: 500 });
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

    return NextResponse.json({
      success: true,
      analysis: parsed,
      uploadedFile: '',
      fileName: file?.name || '직접 입력',
      model,
    });

  } catch (error: any) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: error.message || '분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

