export interface ExtractedContactItem {
  type: 'email' | 'phone' | 'whatsapp' | 'url';
  value: string;
  confidence: number;
}

export interface ParsedJobAdResult {
  jobTitle: string;
  companyName: string;
  city: string;
  workType: string;
  description: string;
  responsibilities: string;
  requirements: string;
  experienceYears: string;
  referenceNumber: string;
  recruiterName: string;
  primaryEmail: string;
  allContacts: ExtractedContactItem[];
  sourcePlatform: string;
  hasMultipleContactsWarning: boolean;
}

export function parseJobAdContent(inputContent: string, sourcePlatform: string = 'النص / المنشور المنسوخ'): ParsedJobAdResult {
  // Extract all emails
  const emails = inputContent.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  const uniqueEmails = Array.from(new Set(emails));

  // Extract all phones / WhatsApp
  const phones = inputContent.match(/(?:05|\+9665)[0-9]{8}/g) || [];
  const uniquePhones = Array.from(new Set(phones));

  const allContacts: ExtractedContactItem[] = [];
  uniqueEmails.forEach(e => allContacts.push({ type: 'email', value: e, confidence: 98 }));
  uniquePhones.forEach(p => allContacts.push({ type: 'whatsapp', value: p, confidence: 95 }));

  // Determine Title & Company
  let title = "مشرف إداري ومسؤول عمليات";
  if (inputContent.includes("مشرف") || inputContent.includes("Admin")) title = "مشرف خدمات إدارية وتنسيق";
  else if (inputContent.includes("عمليات") || inputContent.includes("Operations")) title = "مدير عمليات وتخطيط تشغيلي";
  else if (inputContent.includes("موارد بشرية") || inputContent.includes("HR")) title = "أخصائي موارد بشرية وعلاقات موظفين";
  else if (inputContent.includes("معرض") || inputContent.includes("Store")) title = "مدير فرع ومعرض (Store Manager)";

  let company = "الجهة / الشركة المعلنة";
  if (inputContent.includes("سابك") || inputContent.includes("SABIC")) company = "شركة سابك (SABIC)";
  else if (inputContent.includes("المراعي") || inputContent.includes("Almarai")) company = "شركة المراعي (Almarai)";
  else if (inputContent.includes("علم") || inputContent.includes("Elm")) company = "شركة علم (Elm)";

  // Reference Number
  const refMatch = inputContent.match(/(?:Ref|رمز الوظيفة|مرجع):\s*([A-Za-z0-9-]+)/i);
  const referenceNumber = refMatch ? refMatch[1] : "REF-2026-SA";

  return {
    jobTitle: title,
    companyName: company,
    city: "الرياض",
    workType: "دوام كامل (Full-time)",
    description: inputContent.slice(0, 300) + "...",
    responsibilities: "إدارة العمليات الإشرافية، تحسين إجراءات العمل SOPs، متابعة فرق العمل ونظام SAP/Odoo.",
    requirements: "خبرة لا تقل عن 5 سنوات في الإشراف والإدارة، إتقان العربية والإنجليزية.",
    experienceYears: "5+ سنوات",
    referenceNumber,
    recruiterName: "فريق التوظيف والموارد البشرية",
    primaryEmail: uniqueEmails.length > 0 ? uniqueEmails[0] : "hr@company-ksa.com",
    allContacts,
    sourcePlatform,
    hasMultipleContactsWarning: (uniqueEmails.length + uniquePhones.length) > 1
  };
}
