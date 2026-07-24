// Gemini AI Integration Module for Qaddem AI Platform

export interface GeminiJobAnalysis {
  title: string;
  company: string;
  city: string;
  emails: string[];
  phones: string[];
  forms: string[];
  links: string[];
  genderTarget: 'FEMALE' | 'MALE' | 'BOTH';
  genderEvidence?: string;
  summaryAr: string;
}

export interface GeminiCoverLetterRequest {
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  candidateTitle: string;
  jobTitle: string;
  companyName: string;
  jobDescription?: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Direct call to Google Gemini API REST interface
 */
async function callGeminiApi(prompt: string, jsonMode: boolean = false): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('مفتاح GEMINI_API_KEY غير معرف في بيئة النظام (Environment Variables).');
  }

  const payload: any = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  if (jsonMode) {
    payload.generationConfig = {
      responseMimeType: 'application/json'
    };
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`خطأ في خادم Gemini API (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const textOutput = candidate?.content?.parts?.[0]?.text || '';
  return textOutput;
}

/**
 * Analyze Job Advertisement using Gemini AI
 */
export async function analyzeJobPostingWithGemini(rawText: string): Promise<GeminiJobAnalysis> {
  // Extract regex hard evidence first to enforce Zero Dummy Data rule
  const emails = Array.from(new Set(rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []));
  const phones = Array.from(new Set(rawText.match(/(?:05|\+9665|\+967|\+971|\+965|\+968|\+973)[0-9]{8,10}/g) || []));
  const forms = Array.from(new Set(rawText.match(/https?:\/\/(?:docs\.google\.com\/forms|forms\.gle|typeform\.com)[^\s]+/gi) || []));
  const links = Array.from(new Set(rawText.match(/https?:\/\/[^\s]+/gi) || [])).filter(l => !forms.includes(l));

  if (!GEMINI_API_KEY) {
    // Fallback to strict deterministic parsing if key not present
    let genderTarget: 'FEMALE' | 'MALE' | 'BOTH' = 'BOTH';
    if (rawText.includes('نساء') || rawText.includes('إناث') || rawText.includes('منسقة') || rawText.includes('أخصائية')) {
      genderTarget = 'FEMALE';
    } else if (rawText.includes('رجال') || rawText.includes('ذكور') || rawText.includes('سائق')) {
      genderTarget = 'MALE';
    }

    return {
      title: 'وظيفة معلنة',
      company: 'جهة معلنة',
      city: rawText.includes('الرياض') ? 'الرياض' : (rawText.includes('جدة') ? 'جدة' : 'المملكة العربية السعودية'),
      emails,
      phones,
      forms,
      links,
      genderTarget,
      summaryAr: rawText.slice(0, 300)
    };
  }

  const prompt = `أنت مساعد خبير في تحليل إعلانات الوظائف السعودية والخليجية منصة "قدّم AI".
قم بتحليل النص التالي واستخراج ما يلي في صيغة JSON حصرية فقط بدون أي نصوص خارج الـ JSON:

المطلوب استخراجه:
- title: المسمى الوظيفي المستهدف الصريح
- company: اسم الشركة أو الجهة المعلنة
- city: المدينة السعودية المحددة (مثال: الرياض، جدة، الدمام)
- genderTarget: حدد إما "FEMALE" إذا كان مخصصاً للنساء فقط، "MALE" إذا كان مخصصاً للرجال فقط، أو "BOTH" إذا كان متاحاً لكلا الجنسين.

النص المراد تحليله:
"""
${rawText}
"""`;

  try {
    const jsonString = await callGeminiApi(prompt, true);
    const parsed = JSON.parse(jsonString);

    return {
      title: parsed.title || 'وظيفة معلنة',
      company: parsed.company || 'جهة معلنة',
      city: parsed.city || 'المملكة العربية السعودية',
      emails, // Enforce strict extracted regex emails
      phones, // Enforce strict extracted regex phones
      forms,
      links,
      genderTarget: parsed.genderTarget === 'FEMALE' ? 'FEMALE' : (parsed.genderTarget === 'MALE' ? 'MALE' : 'BOTH'),
      genderEvidence: parsed.genderEvidence,
      summaryAr: rawText.slice(0, 300)
    };
  } catch (err) {
    console.error('Gemini AI analysis error:', err);
    return {
      title: 'وظيفة معلنة',
      company: 'جهة معلنة',
      city: 'المملكة العربية السعودية',
      emails,
      phones,
      forms,
      links,
      genderTarget: 'BOTH',
      summaryAr: rawText.slice(0, 300)
    };
  }
}

/**
 * Generate Customized Arabic Cover Letter / Application Email using Gemini AI
 */
export async function generateCoverLetterWithGemini(req: GeminiCoverLetterRequest): Promise<string> {
  if (!GEMINI_API_KEY) {
    return `السلام عليكم ورحمة الله وبركاته،،\n\nالسادة / فريق الموارد البشرية في ${req.companyName} المحترمين،\n\nأتقدم إليكم بطلب التقديم على شاغر (${req.jobTitle}). أمتلك الخبرات والمهارات اللازمة للقيام بمهام الوظيفة بفاعلية.\n\nتجدون مرفقاً السيرة الذاتية لسيادتكم.\n\nوتفضلوا بقبول خالص الشكر والتقدير،،\n${req.candidateName}\n${req.candidatePhone} | ${req.candidateEmail}`;
  }

  const prompt = `أنت كاتب محترف لرسائل التقديم على الوظائف باللغة العربية مخصص لمنصة "قدّم AI".
اكتب رسالة بريد إلكتروني رسمية واحترافية وجذابة ومختصرة ومقنعة للتقديم على وظيفة بالمعلومات التالية:

- اسم المتقدم: ${req.candidateName}
- مسمى المتقدم الحالي: ${req.candidateTitle}
- البريد الإلكتروني للمتقدم: ${req.candidateEmail}
- الجوال: ${req.candidatePhone}
- الوظيفة المستهدفة: ${req.jobTitle}
- اسم الجهة المعلنة: ${req.companyName}
${req.jobDescription ? `- تفاصيل/متطلبات الوظيفة: ${req.jobDescription}` : ''}

قواعد التنسيق:
- الرسالة باللغة العربية الفصحى الأنيقة.
- تتضمن تحية رسمية، مقدمة موجزة، مؤهلات سريعة، وخاتمة مهنية.
- لا تضع أقواس وهمية أو متغيرات غير ممتلئة.`;

  try {
    const letterText = await callGeminiApi(prompt, false);
    return letterText;
  } catch (err) {
    console.error('Gemini Cover Letter Generation Error:', err);
    return `السلام عليكم ورحمة الله وبركاته،،\n\nالسادة / فريق الموارد البشرية في ${req.companyName} المحترمين،\n\nأتقدم إليكم بطلب التقديم على شاغر (${req.jobTitle}).\n\nمع خالص الشكر،،\n${req.candidateName}`;
  }
}
