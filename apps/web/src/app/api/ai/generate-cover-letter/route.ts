import { NextResponse } from 'next/server';
import { generateCoverLetterWithGemini, GeminiCoverLetterRequest } from '../../../../lib/ai/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json() as GeminiCoverLetterRequest;

    if (!body.candidateName || !body.jobTitle || !body.companyName) {
      return NextResponse.json({ error: 'بيانات المتقدم والوظيفة والشركة مطلوبة لتوليد الخطاب.' }, { status: 400 });
    }

    const coverLetter = await generateCoverLetterWithGemini(body);

    return NextResponse.json({
      success: true,
      coverLetter
    });
  } catch (error: any) {
    console.error('API Generate Cover Letter Error:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء إنشاء الخطاب.' }, { status: 500 });
  }
}
