import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateCoverLetterWithGemini } from '@/lib/ai/gemini';

export const runtime = 'nodejs';

const CoverLetterRequestSchema = z.object({
  candidateName: z.string().trim().min(2).max(120),
  candidateEmail: z.string().trim().email().max(254).optional(),
  candidatePhone: z.string().trim().min(7).max(30).optional(),
  candidateTitle: z.string().trim().max(160).optional(),
  jobTitle: z.string().trim().min(2).max(180),
  companyName: z.string().trim().min(2).max(180),
  jobDescription: z.string().trim().max(20_000).optional(),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsedRequest = CoverLetterRequestSchema.safeParse(body);

    if (!parsedRequest.success) {
      return NextResponse.json(
        {
          error:
            'تحقق من اسم المتقدم والمسمى الوظيفي واسم الشركة وبيانات التواصل.',
        },
        { status: 400 },
      );
    }

    const coverLetter = await generateCoverLetterWithGemini(
      parsedRequest.data,
    );

    return NextResponse.json({ success: true, coverLetter });
  } catch (error) {
    console.error(
      'Cover letter API failed.',
      error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    );
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء خطاب التقديم.' },
      { status: 500 },
    );
  }
}
