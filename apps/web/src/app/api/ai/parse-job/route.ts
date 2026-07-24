import { NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeJobPostingWithGemini } from '@/lib/ai/gemini';

export const runtime = 'nodejs';

const ParseJobRequestSchema = z.object({
  rawText: z.string().trim().min(20).max(50_000),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsedRequest = ParseJobRequestSchema.safeParse(body);

    if (!parsedRequest.success) {
      return NextResponse.json(
        {
          error:
            'أدخل نص إعلان وظيفي صالحًا يتراوح بين 20 و50,000 حرف.',
        },
        { status: 400 },
      );
    }

    const result = await analyzeJobPostingWithGemini(
      parsedRequest.data.rawText,
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error(
      'Job analysis API failed.',
      error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    );
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحليل الإعلان.' },
      { status: 500 },
    );
  }
}
