export interface CoverLetterOptions {
  jobTitle: string;
  companyName: string;
  applicantName: string;
  language: 'ar' | 'en';
  tone: 'Professional' | 'Executive' | 'Short';
  referenceNumber?: string;
}

export function generateCoverLetterText(options: CoverLetterOptions): string {
  const { jobTitle, companyName, applicantName, language, tone, referenceNumber } = options;

  if (language === 'ar') {
    return `السادة / فريق التوظيف والموارد البشرية في ${companyName} المحترمين،

السلام عليكم ورحمة الله وبركاته،،

أتقدم إليكم برغبتي الجادة في التقديم على شاغر (${jobTitle})${referenceNumber ? ` (رمز الوظيفة: ${referenceNumber})` : ''}.

بفضل خبرتي الممتدة التي تزيد عن 8 سنوات في مجالات الإشراف الإداري، إدارة العمليات، والموارد البشرية في كبرى المنشآت بالمملكة العربية السعودية (مثل AACE، وBody Masters، وLandmark Group)، نجحت في بناء وتطوير خطط تشغيلية نجحت في تخفيض التكاليف اللوجستية بنسبة 60% وإدارة الفرق الكبيرة وتطبيق أنظمة SAP وOdoo بكفاءة عالية.

أثق تماماً في قدرتي على تقديم إضافة ملموسة ودعم الأهداف التشغيلية لـ (${companyName}).

مرفق مع هذا الخطاب السيرة الذاتية المفصلة ومؤهلاتي.

وتقبلوا فائق الاحترام والتقدير،،

${applicantName}
الرياض، المملكة العربية السعودية
جوال: 0539491361
بريد: mohammed-alsakran@hotmail.com
LinkedIn: https://www.linkedin.com/in/mohammed-h-al-sakran/`;
  } else {
    return `Dear Hiring Manager at ${companyName},

I am writing to express my strong interest in the (${jobTitle}) position${referenceNumber ? ` (Ref: ${referenceNumber})` : ''}.

With over 8 years of solid experience in operations management, administrative supervision, logistics, and HR processes across major organizations in Saudi Arabia, I have a proven track record of reducing operational logistics costs by 60%, implementing ERP systems (SAP & Odoo), and leading cross-functional teams to achieve strategic growth.

I look forward to discussing how my background and hands-on operational leadership align with your goals at ${companyName}.

Sincerely,

${applicantName}
Riyadh, Saudi Arabia | +966 539491361
Email: mohammed-alsakran@hotmail.com
LinkedIn: https://www.linkedin.com/in/mohammed-h-al-sakran/`;
  }
}

export function generateHtmlEmailTemplate(options: CoverLetterOptions): string {
  const { jobTitle, companyName, applicantName, referenceNumber } = options;

  return `
<div style="direction: rtl; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #cbd5e1;">
    <div style="background-color: #065f46; color: #ffffff; padding: 18px 24px; border-radius: 8px; font-weight: bold; font-size: 18px;">
        💼 طلب توظيف: ${jobTitle} ${referenceNumber ? `(${referenceNumber})` : ''}
    </div>
    
    <div style="padding: 20px 0; color: #1e293b; font-size: 15px; line-height: 1.8;">
        <p><strong>السادة / فريق التوظيف والموارد البشرية في ${companyName} المحترمين،</strong></p>
        <p>السلام عليكم ورحمة الله وبركاته،،</p>
        <p>أتقدم إليكم برغبتي الجادة في التقديم على شاغر (<strong>${jobTitle}</strong>).</p>
        
        <p>بفضل خبرتي الممتدة لأكثر من 8 سنوات في مجالات الإشراف الإداري وإدارة العمليات والخدمات اللوجستية وتطوير أنظمة SOPs وتطبيق أنظمة SAP وOdoo في المنشآت الرائدة، أثق بتقديم قيمة ملموسة لمؤسستكم.</p>

        <div style="background-color: #ffffff; border-right: 4px solid #059669; padding: 14px; margin: 16px 0; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <strong>📌 المستندات المرفقة:</strong> السيرة الذاتية الرسمية (PDF) + خطاب التقديم المخصص.
        </div>

        <p>وتقبلوا فائق الاحترام والتقدير،،</p>
    </div>

    <div style="border-top: 2px solid #e2e8f0; padding-top: 16px; font-size: 14px; color: #475569;">
        <strong style="font-size: 16px; color: #065f46;">${applicantName}</strong><br>
        📍 الرياض، المملكة العربية السعودية<br>
        📞 جوال: 0539491361 | 📧 بريد: mohammed-alsakran@hotmail.com<br>
        🔗 <a href="https://www.linkedin.com/in/mohammed-h-al-sakran/" target="_blank" style="color: #059669; font-weight: bold; text-decoration: none;">حساب LinkedIn الرسمي</a>
    </div>
</div>
  `;
}
