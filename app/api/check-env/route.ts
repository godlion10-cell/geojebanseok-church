import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    gemini: !!process.env.GEMINI_API_KEY,
    geminiPrefix: process.env.GEMINI_API_KEY?.substring(0, 8) || 'NOT SET',
    openai: !!process.env.OPENAI_API_KEY,
    openaiPrefix: process.env.OPENAI_API_KEY?.substring(0, 8) || 'NOT SET',
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('OPENAI') || k.includes('API')),
  });
}
