import {
  clampConfidence,
  emptyField,
  type ExtractedField,
  type ParsedEducation,
  type ParsedExperience,
  type ParsedResumeData,
  type ParsedSkill,
} from './resume';

const SAUDI_CITIES = [
  'الرياض',
  'جدة',
  'مكة المكرمة',
  'مكة',
  'المدينة المنورة',
  'المدينة',
  'الدمام',
  'الخبر',
  'الظهران',
  'الجبيل',
  'الأحساء',
  'الهفوف',
  'القطيف',
  'الطائف',
  'تبوك',
  'أبها',
  'خميس مشيط',
  'جازان',
  'نجران',
  'حائل',
  'بريدة',
  'عنيزة',
  'ينبع',
  'الخرج',
  'الباحة',
  'عرعر',
  'سكاكا',
  'حفر الباطن',
] as const;

const SECTION_HEADINGS = [
  'experience',
  'work experience',
  'professional experience',
  'employment history',
  'الخبرات',
  'الخبرة العملية',
  'الخبرات العملية',
  'skills',
  'technical skills',
  'المهارات',
  'المهارات التقنية',
  'education',
  'academic background',
  'التعليم',
  'المؤهلات العلمية',
  'summary',
  'profile',
  'professional summary',
  'نبذة',
  'الملخص المهني',
  'certifications',
  'الشهادات',
  'languages',
  'اللغات',
];

const DEGREE_WORDS =
  /(?:بكالوريوس|دبلوم|ماجستير|دكتوراه|ثانوية|Bachelor(?:'s)?|Diploma|Master(?:'s)?|PhD|Doctorate|B\.?Sc|M\.?Sc)/i;

function normalizeText(text: string): string {
  return text
    .replace(/\u0000/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function linesOf(text: string): string[] {
  return normalizeText(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function snippet(value: string | null): string | null {
  if (!value) return null;
  return value.replace(/\s+/g, ' ').trim().slice(0, 240);
}

function field<T>(
  value: T | null,
  confidence: number,
  sourceText: string | null,
): ExtractedField<T> {
  if (value === null) return emptyField<T>();
  return {
    value,
    confidence: clampConfidence(confidence),
    sourceText: snippet(sourceText),
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findLabel(
  lines: string[],
  labels: string[],
): { value: string; source: string } | null {
  const pattern = new RegExp(
    `^(?:${labels.map(escapeRegExp).join('|')})\\s*[:：\\-–]\\s*(.+)$`,
    'i',
  );

  for (const line of lines) {
    const match = line.match(pattern);
    if (match?.[1]?.trim()) {
      return { value: match[1].trim(), source: line };
    }
  }

  return null;
}

function firstMatch(
  text: string,
  pattern: RegExp,
): { value: string; source: string } | null {
  const match = text.match(pattern);
  if (!match?.[1]) return null;
  return {
    value: match[1].trim(),
    source: match[0].trim(),
  };
}

function extractEmail(text: string): ExtractedField<string> {
  const match = text.match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,24}/i,
  );
  return match ? field(match[0].toLowerCase(), 0.99, match[0]) : emptyField();
}

function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();
  let digits = trimmed.replace(/\D/g, '');

  if (digits.startsWith('00966')) digits = digits.slice(2);
  if (digits.startsWith('9665') && digits.length === 12) return `+${digits}`;
  if (digits.startsWith('05') && digits.length === 10) {
    return `+966${digits.slice(1)}`;
  }

  if (trimmed.startsWith('+') && digits.length >= 9 && digits.length <= 15) {
    return `+${digits}`;
  }

  return digits.length >= 9 && digits.length <= 15 ? digits : null;
}

function extractPhone(text: string): ExtractedField<string> {
  const candidates =
    text.match(
      /(?:(?:\+|00)\d{1,3}[\s().-]?)?(?:0?5\d|[1-9]\d{1,2})(?:[\s().-]?\d){6,10}/g,
    ) ?? [];

  for (const candidate of candidates) {
    const normalized = normalizePhone(candidate);
    if (normalized) return field(normalized, 0.94, candidate);
  }

  return emptyField();
}

function extractNames(lines: string[]): {
  firstName: ExtractedField<string>;
  lastName: ExtractedField<string>;
  englishName: ExtractedField<string>;
} {
  const labelled = findLabel(lines, [
    'الاسم الكامل',
    'الاسم',
    'full name',
    'name',
  ]);

  const result = {
    firstName: emptyField<string>(),
    lastName: emptyField<string>(),
    englishName: emptyField<string>(),
  };

  if (labelled) {
    const words = labelled.value.split(/\s+/).filter(Boolean);
    const hasArabic = /[\u0600-\u06ff]/.test(labelled.value);
    const hasLatin = /[A-Za-z]/.test(labelled.value);

    if (hasArabic && words.length >= 2) {
      result.firstName = field(words[0], 0.82, labelled.source);
      result.lastName = field(words.at(-1) ?? null, 0.76, labelled.source);
    }

    if (hasLatin && words.length >= 2) {
      result.englishName = field(labelled.value, 0.9, labelled.source);
    }

    return result;
  }

  const topCandidate = lines.slice(0, 8).find((line) => {
    const words = line.split(/\s+/);
    return (
      words.length >= 2 &&
      words.length <= 5 &&
      line.length <= 70 &&
      !/@/.test(line) &&
      !/\d{5,}/.test(line) &&
      !SECTION_HEADINGS.some(
        (heading) => line.toLowerCase() === heading.toLowerCase(),
      )
    );
  });

  if (!topCandidate) return result;

  const words = topCandidate.split(/\s+/);
  if (/^[A-Za-z .'-]+$/.test(topCandidate)) {
    result.englishName = field(topCandidate, 0.58, topCandidate);
  } else if (/[\u0600-\u06ff]/.test(topCandidate)) {
    result.firstName = field(words[0], 0.52, topCandidate);
    result.lastName = field(words.at(-1) ?? null, 0.48, topCandidate);
  }

  return result;
}

function extractCity(lines: string[], text: string): ExtractedField<string> {
  const labelled = findLabel(lines, [
    'المدينة',
    'مدينة الإقامة',
    'الموقع',
    'location',
    'city',
  ]);
  if (labelled) return field(labelled.value, 0.9, labelled.source);

  const city = SAUDI_CITIES.find((candidate) => text.includes(candidate));
  return city ? field(city, 0.68, city) : emptyField();
}

function extractCountry(lines: string[], text: string): ExtractedField<string> {
  const labelled = findLabel(lines, ['الدولة', 'country']);
  if (labelled) return field(labelled.value, 0.9, labelled.source);

  const known = [
    ['المملكة العربية السعودية', 'المملكة العربية السعودية'],
    ['Saudi Arabia', 'Saudi Arabia'],
    ['United Arab Emirates', 'United Arab Emirates'],
    ['الإمارات العربية المتحدة', 'الإمارات العربية المتحدة'],
  ] as const;

  const match = known.find(([needle]) =>
    text.toLowerCase().includes(needle.toLowerCase()),
  );
  return match ? field(match[1], 0.7, match[0]) : emptyField();
}

function extractNationality(lines: string[]): ExtractedField<string> {
  const labelled = findLabel(lines, ['الجنسية', 'nationality']);
  return labelled
    ? field(labelled.value, 0.93, labelled.source)
    : emptyField();
}

function extractProfessionalTitle(
  lines: string[],
): ExtractedField<string> {
  const labelled = findLabel(lines, [
    'المسمى الوظيفي',
    'المسمى المهني',
    'المنصب',
    'professional title',
    'job title',
    'headline',
  ]);
  if (labelled) return field(labelled.value, 0.91, labelled.source);

  const candidate = lines.slice(0, 12).find((line) => {
    return (
      line.length >= 4 &&
      line.length <= 90 &&
      !/@/.test(line) &&
      !/\d{5,}/.test(line) &&
      /(?:مهندس|مدير|محاسب|مصمم|مطور|أخصائي|مشرف|منسق|Engineer|Manager|Developer|Designer|Accountant|Specialist)/i.test(
        line,
      )
    );
  });

  return candidate ? field(candidate, 0.62, candidate) : emptyField();
}

function extractSection(
  text: string,
  headings: string[],
): { value: string; source: string } | null {
  const normalized = normalizeText(text);
  const allHeadingPattern = SECTION_HEADINGS.map(escapeRegExp).join('|');
  const requested = headings.map(escapeRegExp).join('|');
  const pattern = new RegExp(
    `(?:^|\\n)(?:${requested})\\s*[:：]?\\s*\\n([\\s\\S]*?)(?=\\n(?:${allHeadingPattern})\\s*[:：]?\\s*(?:\\n|$)|$)`,
    'i',
  );
  const match = normalized.match(pattern);
  if (!match?.[1]?.trim()) return null;
  return {
    value: match[1].trim(),
    source: match[0].trim(),
  };
}

function extractSummary(text: string): ExtractedField<string> {
  const section = extractSection(text, [
    'summary',
    'professional summary',
    'profile',
    'نبذة',
    'الملخص المهني',
  ]);
  if (!section) return emptyField();

  const value = section.value.replace(/\n+/g, ' ').trim().slice(0, 1200);
  return value.length >= 20
    ? field(value, 0.78, section.source)
    : emptyField();
}

function extractYears(text: string): ExtractedField<number> {
  const patterns = [
    /(?:خبرة|الخبرة)\s*(?:تتجاوز|تزيد عن|حوالي|قدرها|:)?\s*(\d{1,2})\s*(?:سنوات|سنة)/i,
    /(\d{1,2})\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience/i,
  ];

  for (const pattern of patterns) {
    const match = firstMatch(text, pattern);
    if (!match) continue;
    const years = Number.parseInt(match.value, 10);
    if (years >= 0 && years <= 60) {
      return field(years, 0.92, match.source);
    }
  }

  return emptyField();
}

function parseSkills(text: string): ParsedSkill[] {
  const section = extractSection(text, [
    'skills',
    'technical skills',
    'المهارات',
    'المهارات التقنية',
  ]);
  if (!section) return [];

  const values = section.value
    .split(/[\n,،;؛|•·]+/)
    .map((item) => item.replace(/^[-–—*]\s*/, '').trim())
    .filter((item) => item.length >= 2 && item.length <= 80)
    .filter(
      (item) =>
        !SECTION_HEADINGS.some(
          (heading) => item.toLowerCase() === heading.toLowerCase(),
        ),
    );

  return Array.from(new Set(values)).slice(0, 50).map((name) => ({
    name,
    category: null,
    sourceText: name,
  }));
}

function parseDateRange(block: string): {
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
} {
  const match = block.match(
    /((?:19|20)\d{2}(?:[/-]\d{1,2})?)\s*(?:-|–|—|إلى|to)\s*((?:19|20)\d{2}(?:[/-]\d{1,2})?|حتى الآن|الآن|present|current)/i,
  );

  if (!match) {
    return { startDate: null, endDate: null, isCurrent: false };
  }

  const isCurrent = /حتى الآن|الآن|present|current/i.test(match[2]);
  return {
    startDate: match[1],
    endDate: isCurrent ? null : match[2],
    isCurrent,
  };
}

function parseExperiences(text: string): ParsedExperience[] {
  const section = extractSection(text, [
    'experience',
    'work experience',
    'professional experience',
    'employment history',
    'الخبرات',
    'الخبرة العملية',
    'الخبرات العملية',
  ]);
  if (!section) return [];

  const blocks = section.value
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length >= 8);

  const results: ParsedExperience[] = [];

  for (const block of blocks) {
    const lines = linesOf(block);
    if (lines.length === 0) continue;

    let position: string | null = null;
    let company: string | null = null;

    const atMatch = lines[0]?.match(/^(.+?)\s+(?:at|@|لدى|في)\s+(.+)$/i);
    const pipeMatch = lines[0]?.match(/^(.+?)\s*[|–—-]\s*(.+)$/);

    if (atMatch) {
      position = atMatch[1].trim();
      company = atMatch[2].trim();
    } else if (pipeMatch && !/\d{4}/.test(lines[0])) {
      position = pipeMatch[1].trim();
      company = pipeMatch[2].trim();
    } else if (lines.length >= 2 && !/\d{4}/.test(lines[1])) {
      position = lines[0];
      company = lines[1];
    }

    if (!position && !company) continue;

    const dates = parseDateRange(block);
    const descriptionLines = lines.filter(
      (line) =>
        line !== position &&
        line !== company &&
        !/((?:19|20)\d{2}).*(?:19|20)\d{2}|present|current|حتى الآن/i.test(
          line,
        ),
    );

    results.push({
      company,
      position,
      startDate: dates.startDate,
      endDate: dates.endDate,
      isCurrent: dates.isCurrent,
      description: descriptionLines.join(' ').trim() || null,
      sourceText: snippet(block) ?? block.slice(0, 240),
    });
  }

  return results.slice(0, 20);
}

function parseEducations(text: string): ParsedEducation[] {
  const section = extractSection(text, [
    'education',
    'academic background',
    'التعليم',
    'المؤهلات العلمية',
  ]);
  if (!section) return [];

  const blocks = section.value
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length >= 5);

  const results: ParsedEducation[] = [];

  for (const block of blocks) {
    const lines = linesOf(block);
    const degreeLine = lines.find((line) => DEGREE_WORDS.test(line)) ?? null;
    const institutionLine =
      lines.find(
        (line) =>
          /(?:جامعة|كلية|معهد|University|College|Institute)/i.test(line) &&
          line !== degreeLine,
      ) ?? null;

    if (!degreeLine && !institutionLine) continue;

    const gpaMatch = block.match(
      /(?:المعدل|GPA)\s*[:：]?\s*([0-9.]+\s*(?:\/\s*[0-9.]+)?)/i,
    );
    const fieldMatch = degreeLine?.match(
      /(?:في|تخصص|in)\s+(.+?)(?:\s*[|–—-]\s*|$)/i,
    );

    results.push({
      institution: institutionLine,
      degree: degreeLine,
      fieldOfStudy: fieldMatch?.[1]?.trim() ?? null,
      gpa: gpaMatch?.[1]?.trim() ?? null,
      sourceText: snippet(block) ?? block.slice(0, 240),
    });
  }

  return results.slice(0, 10);
}

export function parseResumeText(input: string): ParsedResumeData {
  const text = normalizeText(input);
  const lines = linesOf(text);
  const names = extractNames(lines);

  const warnings: string[] = [];
  if (text.length < 100) {
    warnings.push(
      'النص المستخرج قصير؛ قد تكون السيرة مصورة أو تحتاج إلى OCR.',
    );
  }

  return {
    personalInfo: {
      firstName: names.firstName,
      lastName: names.lastName,
      englishName: names.englishName,
      email: extractEmail(text),
      phone: extractPhone(text),
      city: extractCity(lines, text),
      country: extractCountry(lines, text),
      nationality: extractNationality(lines),
    },
    careerInfo: {
      professionalTitle: extractProfessionalTitle(lines),
      summary: extractSummary(text),
      totalYearsExperience: extractYears(text),
    },
    experiences: parseExperiences(text),
    skills: parseSkills(text),
    educations: parseEducations(text),
    warnings,
  };
}
