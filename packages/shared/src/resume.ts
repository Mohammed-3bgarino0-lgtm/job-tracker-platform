export interface ExtractedField<T> {
  value: T | null;
  confidence: number;
  sourceText: string | null;
}

export interface ParsedExperience {
  company: string | null;
  position: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
  sourceText: string;
}

export interface ParsedSkill {
  name: string;
  category: string | null;
  sourceText: string;
}

export interface ParsedEducation {
  institution: string | null;
  degree: string | null;
  fieldOfStudy: string | null;
  gpa: string | null;
  sourceText: string;
}

export interface ParsedResumeData {
  personalInfo: {
    firstName: ExtractedField<string>;
    lastName: ExtractedField<string>;
    englishName: ExtractedField<string>;
    email: ExtractedField<string>;
    phone: ExtractedField<string>;
    city: ExtractedField<string>;
    country: ExtractedField<string>;
    nationality: ExtractedField<string>;
  };
  careerInfo: {
    professionalTitle: ExtractedField<string>;
    summary: ExtractedField<string>;
    totalYearsExperience: ExtractedField<number>;
  };
  experiences: ParsedExperience[];
  skills: ParsedSkill[];
  educations: ParsedEducation[];
  warnings: string[];
}

export function emptyField<T>(): ExtractedField<T> {
  return {
    value: null,
    confidence: 0,
    sourceText: null,
  };
}

export function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, Number(value.toFixed(2))));
}

export function calculateOverallConfidence(data: ParsedResumeData): number {
  const fields: Array<ExtractedField<unknown>> = [
    ...Object.values(data.personalInfo),
    ...Object.values(data.careerInfo),
  ];

  const extracted = fields.filter((field) => field.value !== null);
  if (extracted.length === 0) return 0;

  const total = extracted.reduce(
    (sum, field) => sum + clampConfidence(field.confidence),
    0,
  );

  return clampConfidence(total / extracted.length);
}
