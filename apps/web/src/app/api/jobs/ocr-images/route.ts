import { QADDEM_BRIDGE_LIMITS, parseSafeScanUrl } from '@qaddem/shared';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  analyzeJobImagesWithGemini,
  isGeminiConfigured,
} from '@/lib/ai/gemini';
import { fetchPublicImage } from '@/lib/ai/safe-image-fetch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const nullableText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .nullable()
    .optional()
    .transform((value) => value || null);

const OcrJobSchema = z.object({
  sourceUrl: z.string().url().max(2_000),
  title: nullableText(180),
  company: nullableText(180),
  location: nullableText(180),
  description: nullableText(8_000),
  imageUrls: z
    .array(z.string().url().max(2_000))
    .min(1)
    .max(QADDEM_BRIDGE_LIMITS.maxImagesPerJob),
});

const OcrRequestSchema = z.object({
  jobs: z
    .array(OcrJobSchema)
    .min(1)
    .max(QADDEM_BRIDGE_LIMITS.maxOcrJobsPerRequest),
});

function safeSourceUrl(value: string): string | null {
  return parseSafeScanUrl(value)?.toString() ?? null;
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > 250_000) {
    return NextResponse.json({ error: 'حجم طلب تحليل الصور أكبر من المسموح.' }, { status: 413 });
  }

  if (!isGeminiConfigured()) {
    return NextResponse.json(
      { error: 'خدمة OCR غير مفعلة. أضف GEMINI_API_KEY في متغيرات Railway.' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'طلب JSON غير صالح.' }, { status: 400 });
  }

  const parsed = OcrRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'بيانات وظائف الصور غير صالحة أو تتجاوز الحدود المسموحة.' },
      { status: 400 },
    );
  }

  const results = [];

  for (const job of parsed.data.jobs) {
    const sourceUrl = safeSourceUrl(job.sourceUrl);
    if (!sourceUrl) {
      results.push({ sourceUrl: job.sourceUrl, status: 'failed', error: 'UNSAFE_SOURCE_URL' });
      continue;
    }

    const safeImageUrls = job.imageUrls
      .map(safeSourceUrl)
      .filter((value): value is string => Boolean(value));
    const fetched = await Promise.allSettled(safeImageUrls.map(fetchPublicImage));
    const images = fetched
      .filter((result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchPublicImage>>> => result.status === 'fulfilled')
      .map((result) => result.value);

    if (images.length === 0) {
      results.push({
        sourceUrl,
        status: 'failed',
        error: 'NO_PUBLIC_IMAGES_FETCHED',
        attemptedImages: safeImageUrls.length,
      });
      continue;
    }

    try {
      const existingText = [job.title, job.company, job.location, job.description]
        .filter(Boolean)
        .join('\n');
      const analysis = await analyzeJobImagesWithGemini(images, existingText);
      results.push({
        sourceUrl,
        status: 'complete',
        imageUrls: images.map((image) => image.sourceUrl),
        ocrText: analysis.extractedText,
        title: analysis.title,
        company: analysis.company,
        location: analysis.city,
        summaryAr: analysis.summaryAr,
        emails: analysis.emails,
        phones: analysis.phones,
        forms: analysis.forms,
        links: analysis.links,
        genderTarget: analysis.genderTarget,
        genderEvidence: analysis.genderEvidence,
        warnings: analysis.warnings,
      });
    } catch (error) {
      console.error(
        'Job image OCR failed',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      );
      results.push({ sourceUrl, status: 'failed', error: 'OCR_ANALYSIS_FAILED' });
    }
  }

  const processed = results.filter((result) => result.status === 'complete').length;
  const failed = results.length - processed;

  return NextResponse.json(
    { success: true, processed, failed, results },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
