import {
  TargetGender,
  classifyJobGender,
} from '@qaddem/shared';
import { z } from 'zod';
import type { SafeInlineImage } from './safe-image-fetch';

export type JobGenderTarget =
  | 'FEMALE'
  | 'MALE'
  | 'BOTH'
  | 'UNSPECIFIED';

export interface GeminiJobAnalysis {
  title: string | null;
  company: string | null;
  city: string | null;
  emails: string[];
  phones: string[];
  forms: string[];
  links: string[];
  genderTarget: JobGenderTarget;
  genderEvidence: string[];
  genderConfidence: number;
  summaryAr: string | null;
  source: 'gemini' | 'deterministic';
  warnings: string[];
}

export interface GeminiImageJobAnalysis extends GeminiJobAnalysis {
  extractedText: string | null;
}

export interface GeminiCoverLetterRequest {
  candidateName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  candidateTitle?: string;
  jobTitle: string;
  companyName: string;
  jobDescription?: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim() ?? '';
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const GeminiJobFieldsSchema = z.object({
  title: z.string(),
  company: z.string(),
  city: z.string(),
  summaryAr: z.string(),
});

const GeminiImageFieldsSchema = GeminiJobFieldsSchema.extend({
  extractedText: z.string(),
});

type GeminiJobFields = z.infer<typeof GeminiJobFieldsSchema>;
type GeminiImageFields = z.infer<typeof GeminiImageFieldsSchema>;

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

interface GeminiPart {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

function normalizeNullable(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function uniqueMatches(text: string, pattern: RegExp): string[] {
  return Array.from(new Set(text.match(pattern) ?? []));
}

function extractContacts(rawText: string) {
  const emails = uniqueMatches(
    rawText,
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  );
  const phones = uniqueMatches(
    rawText,
    /(?:\+?9665|05|\+?967|\+?971|\+?965|\+?968|\+?973)[0-9\s-]{7,12}/g,
  ).map((phone) => phone.trim());
  const forms = uniqueMatches(
    rawText,
    /https?:\/\/(?:docs\.google\.com\/forms|forms\.gle|(?:www\.)?typeform\.com)\/[^\s]+/gi,
  );
  const allLinks = uniqueMatches(rawText, /https?:\/\/[^\s]+/gi).map(
    (link) => link.replace(/[),.;!?،؛]+$/u, ''),
  );
  const links = allLinks.filter((link) => !forms.includes(link));

  return { emails, phones, forms, links };
}

function mapGenderTarget(target: TargetGender): JobGenderTarget {
  switch (target) {
    case TargetGender.FEMALE:
      return 'FEMALE';
    case TargetGender.MALE:
      return 'MALE';
    case TargetGender.BOTH:
      return 'BOTH';
    default:
      return 'UNSPECIFIED';
  }
}

function deterministicJobAnalysis(rawText: string): GeminiJobAnalysis {
  const contacts = extractContacts(rawText);
  const gender = classifyJobGender('', rawText);

  return {
    title: null,
    company: null,
    city: null,
    ...contacts,
    genderTarget: mapGenderTarget(gender.targetGender),
    genderEvidence: gender.evidence,
    genderConfidence: gender.confidence,
    summaryAr: null,
    source: 'deterministic',
    warnings: GEMINI_API_KEY
      ? []
      : ['لم يُضبط GEMINI_API_KEY؛ أُعيدت البيانات المؤكدة فقط دون تخمين.'],
  };
}

export function isGeminiConfigured(): boolean {
  return Boolean(GEMINI_API_KEY);
}

async function callGeminiParts(
  parts: GeminiPart[],
  responseSchema?: Record<string, unknown>,
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
  }

  const payload: Record<string, unknown> = {
    contents: [{ role: 'user', parts }],
  };

  if (responseSchema) {
    payload.generationConfig = {
      responseMimeType: 'application/json',
      responseSchema,
    };
  }

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(45_000),
  });

  if (!response.ok) {
    throw new Error(`GEMINI_API_${response.status}`);
  }

  const data = (await response.json()) as GeminiGenerateContentResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!text) {
    throw new Error('GEMINI_EMPTY_RESPONSE');
  }

  return text;
}

async function callGeminiApi(
  prompt: string,
  jsonMode = false,
): Promise<string> {
  return callGeminiParts(
    [{ text: prompt }],
    jsonMode
      ? {
          type: 'object',
          properties: {
            title: { type: 'string' },
            company: { type: 'string' },
            city: { type: 'string' },
            summaryAr: { type: 'string' },
          },
          required: ['title', 'company', 'city', 'summaryAr'],
        }
      : undefined,
  );
}

export async function analyzeJobPostingWithGemini(
  rawText: string,
): Promise<GeminiJobAnalysis> {
  const deterministic = deterministicJobAnalysis(rawText);

  if (!GEMINI_API_KEY) {
    return deterministic;
  }

  const prompt = `حلل إعلان الوظيفة التالي واستخرج المعلومات الصريحة فقط.

قواعد إلزامية:
- لا تخترع أي قيمة.
- عند غياب المسمى أو الشركة أو المدينة أو الملخص، أعد سلسلة فارغة.
- لا تستنتج الجنس من المسمى المهني أو الصور النمطية؛ تصنيف الجنس سيعالج خارج النموذج.
- الملخص يجب أن يلخص النص فقط دون إضافة مهارات أو شروط غير موجودة.

الإعلان:
"""
${rawText}
"""`;

  try {
    const rawJson = await callGeminiApi(prompt, true);
    const parsed: GeminiJobFields = GeminiJobFieldsSchema.parse(
      JSON.parse(rawJson),
    );

    return {
      ...deterministic,
      title: normalizeNullable(parsed.title),
      company: normalizeNullable(parsed.company),
      city: normalizeNullable(parsed.city),
      summaryAr: normalizeNullable(parsed.summaryAr),
      source: 'gemini',
      warnings: [],
    };
  } catch (error) {
    console.error(
      'Gemini job analysis failed; deterministic result returned.',
      error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    );
    return {
      ...deterministic,
      warnings: [
        'تعذر تحليل الإعلان بالذكاء الاصطناعي؛ أُعيدت البيانات المؤكدة فقط دون قيم بديلة.',
      ],
    };
  }
}

export async function analyzeJobImagesWithGemini(
  images: SafeInlineImage[],
  existingText = '',
): Promise<GeminiImageJobAnalysis> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
  if (images.length === 0) throw new Error('NO_IMAGES');

  const prompt = `اقرأ صور إعلان الوظيفة المرفقة باستخدام OCR ثم استخرج المعلومات الصريحة فقط.

قواعد إلزامية:
- انسخ النص المقروء في extractedText دون اختراع نص غير ظاهر.
- عند غياب المسمى أو الشركة أو المدينة أو الملخص، أعد سلسلة فارغة.
- لا تستنتج الجنس من المسمى أو الصورة؛ سيصنف خارج النموذج من النص الصريح فقط.
- لا تضف بريدًا أو رقمًا أو رابطًا غير ظاهر في الصور.
- قد تكون الصور جزءًا من الإعلان نفسه، فادمج نصوصها بالترتيب.
${existingText.trim() ? `\nنص الصفحة المرافق للاستئناس فقط:\n${existingText.slice(0, 5000)}` : ''}`;

  const parts: GeminiPart[] = [
    { text: prompt },
    ...images.map((image) => ({
      inline_data: {
        mime_type: image.mimeType,
        data: image.base64Data,
      },
    })),
  ];

  const rawJson = await callGeminiParts(parts, {
    type: 'object',
    properties: {
      extractedText: { type: 'string' },
      title: { type: 'string' },
      company: { type: 'string' },
      city: { type: 'string' },
      summaryAr: { type: 'string' },
    },
    required: ['extractedText', 'title', 'company', 'city', 'summaryAr'],
  });
  const parsed: GeminiImageFields = GeminiImageFieldsSchema.parse(JSON.parse(rawJson));
  const extractedText = normalizeNullable(parsed.extractedText);
  const deterministic = deterministicJobAnalysis(
    [existingText, extractedText].filter(Boolean).join('\n'),
  );

  return {
    ...deterministic,
    extractedText,
    title: normalizeNullable(parsed.title),
    company: normalizeNullable(parsed.company),
    city: normalizeNullable(parsed.city),
    summaryAr: normalizeNullable(parsed.summaryAr),
    source: 'gemini',
    warnings: [],
  };
}

function buildSafeFallbackLetter(
  request: GeminiCoverLetterRequest,
): string {
  const contact = [request.candidatePhone, request.candidateEmail]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(' | ');

  return `السلام عليكم ورحمة الله وبركاته،

السادة فريق التوظيف في ${request.companyName} المحترمين،

أتقدم للتقديم على وظيفة ${request.jobTitle}. أرفق سيرتي الذاتية للاطلاع على خبراتي ومؤهلاتي، ويسعدني مناقشة مدى ملاءمتي للفرصة.

وتفضلوا بقبول خالص التقدير،
${request.candidateName}${contact ? `\n${contact}` : ''}`;
}

export async function generateCoverLetterWithGemini(
  request: GeminiCoverLetterRequest,
): Promise<string> {
  if (!GEMINI_API_KEY) {
    return buildSafeFallbackLetter(request);
  }

  const prompt = `اكتب رسالة تقديم عربية رسمية ومختصرة اعتمادًا على المعلومات التالية فقط.
لا تضف خبرة أو مهارة أو إنجازًا غير مذكور، ولا تدّعِ ملاءمة غير مثبتة.

اسم المتقدم: ${request.candidateName}
المسمى الحالي: ${request.candidateTitle?.trim() || 'غير محدد'}
الوظيفة المستهدفة: ${request.jobTitle}
الشركة: ${request.companyName}
وصف الوظيفة: ${request.jobDescription?.trim() || 'غير متوفر'}
البريد: ${request.candidateEmail?.trim() || 'غير متوفر'}
الجوال: ${request.candidatePhone?.trim() || 'غير متوفر'}

أعد نص الرسالة فقط دون عنوان أو شرح إضافي.`;

  try {
    return await callGeminiApi(prompt);
  } catch (error) {
    console.error(
      'Gemini cover letter generation failed; safe template returned.',
      error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    );
    return buildSafeFallbackLetter(request);
  }
}
