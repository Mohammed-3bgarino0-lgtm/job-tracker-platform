import { NextResponse } from 'next/server';
import { analyzeJobPostingWithGemini } from '../../../../lib/ai/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rawText } = body;

    if (!rawText || typeof rawText !== 'string') {
      return NextResponse.json({ error: 'نص الإعلان المطلوب تحليله مفقود.' }, { status: 400 });
    }

    const result = await analyzeJobPostingWithGemini(rawText);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('API Parse Job Error:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء تحليل الإعلان.' }, { status: 500 });
  }
}
