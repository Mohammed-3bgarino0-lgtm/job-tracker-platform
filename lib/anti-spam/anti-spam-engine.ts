export interface AntiSpamCheckResult {
  isSafe: boolean;
  warnings: string[];
  mismatchedDomainWarning?: string;
  suspiciousDomainWarning?: string;
}

export function validateOutboundEmail(recipientEmail: string, companyName: string): AntiSpamCheckResult {
  const warnings: string[] = [];

  // Check email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(recipientEmail)) {
    warnings.push("عنوان البريد الإلكتروني غير صحيح صيغياً!");
  }

  // Suspicious domain checks (e.g. temporary email services)
  const suspiciousDomains = ['tempmail.com', 'mailinator.com', 'dispostable.com', '10minutemail.com'];
  const domain = recipientEmail.split('@')[1]?.toLowerCase() || '';

  if (suspiciousDomains.includes(domain)) {
    warnings.push(`تحذير: النطاق @${domain} يبدو بريداً مؤقتاً أو غير موثق!`);
  }

  // Domain Mismatch Check
  let mismatchedDomainWarning: string | undefined = undefined;
  if (companyName && !domain.includes('gmail.com') && !domain.includes('hotmail.com') && !domain.includes('yahoo.com')) {
    const cleanCompanyStr = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanCompanyStr.length > 3 && !domain.includes(cleanCompanyStr)) {
      mismatchedDomainWarning = `تنبيه: نطاق البريد الإلكتروني (@${domain}) قد لا يطابق النطاق الرسمي لشركة "${companyName}". يرجى التأكد قبل الإرسال.`;
    }
  }

  return {
    isSafe: warnings.length === 0,
    warnings,
    mismatchedDomainWarning,
    suspiciousDomainWarning: suspiciousDomains.includes(domain) ? `نطاق غير موثوق: @${domain}` : undefined
  };
}
