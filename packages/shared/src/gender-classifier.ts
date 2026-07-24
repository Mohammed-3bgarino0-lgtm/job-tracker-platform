export enum TargetGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  BOTH = 'BOTH',
  UNSPECIFIED = 'UNSPECIFIED',
}

export interface GenderClassificationResult {
  targetGender: TargetGender;
  confidence: number;
  evidence: string[];
  isExplicit: boolean;
  policy: 'EXPLICIT_ONLY';
}

const BOTH_PATTERNS = [
  /للجنسين(?:\s+من\s+الرجال\s+والنساء)?/giu,
  /(?:رجال|ذكور)\s*(?:و|\/|أو)\s*(?:نساء|اناث)/giu,
  /(?:نساء|اناث)\s*(?:و|\/|أو)\s*(?:رجال|ذكور)/giu,
  /لا\s+يشترط\s+(?:الجنس|نوع\s+الجنس)/giu,
  /متاح(?:ة)?\s+(?:للجميع|لكلا\s+الجنسين)/giu,
  /(?:all genders?|male and female|men and women|open to everyone)/giu,
];

const FEMALE_PATTERNS = [
  /(?:للنساء|للسيدات|للاناث)(?:\s+فقط)?/giu,
  /(?:مخصص(?:ة)?|موجه(?:ة)?)\s+(?:للنساء|للسيدات|للاناث)/giu,
  /(?:مطلوب(?:ة)?|نبحث\s+عن)\s+(?:موظفات|متقدمات|سعوديات)(?:\s+فقط)?/giu,
  /(?:female candidates? only|women only|female only|for women)/giu,
];

const MALE_PATTERNS = [
  /(?:للرجال|للذكور)(?:\s+فقط)?/giu,
  /(?:مخصص|موجه)\s+(?:للرجال|للذكور)/giu,
  /(?:مطلوب|نبحث\s+عن)\s+(?:موظفين\s+رجال|متقدمين\s+رجال|سعوديين\s+فقط)/giu,
  /(?:male candidates? only|men only|male only|for men)/giu,
];

function normalizeText(input: string): string {
  return input
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/ـ/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function collectEvidence(text: string, patterns: RegExp[]): string[] {
  const evidence = new Set<string>();

  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      const value = match[0]?.trim();
      if (value) evidence.add(value);
    }
  }

  return Array.from(evidence);
}

export function classifyJobGender(
  title: string,
  description = '',
): GenderClassificationResult {
  const text = normalizeText(`${title}\n${description}`);

  if (!text) {
    return {
      targetGender: TargetGender.UNSPECIFIED,
      confidence: 0,
      evidence: [],
      isExplicit: false,
      policy: 'EXPLICIT_ONLY',
    };
  }

  const bothEvidence = collectEvidence(text, BOTH_PATTERNS);
  const femaleEvidence = collectEvidence(text, FEMALE_PATTERNS);
  const maleEvidence = collectEvidence(text, MALE_PATTERNS);

  if (bothEvidence.length > 0) {
    return {
      targetGender: TargetGender.BOTH,
      confidence: 0.99,
      evidence: bothEvidence,
      isExplicit: true,
      policy: 'EXPLICIT_ONLY',
    };
  }

  if (femaleEvidence.length > 0 && maleEvidence.length > 0) {
    return {
      targetGender: TargetGender.BOTH,
      confidence: 0.94,
      evidence: [...femaleEvidence, ...maleEvidence],
      isExplicit: true,
      policy: 'EXPLICIT_ONLY',
    };
  }

  if (femaleEvidence.length > 0) {
    return {
      targetGender: TargetGender.FEMALE,
      confidence: 0.97,
      evidence: femaleEvidence,
      isExplicit: true,
      policy: 'EXPLICIT_ONLY',
    };
  }

  if (maleEvidence.length > 0) {
    return {
      targetGender: TargetGender.MALE,
      confidence: 0.97,
      evidence: maleEvidence,
      isExplicit: true,
      policy: 'EXPLICIT_ONLY',
    };
  }

  return {
    targetGender: TargetGender.UNSPECIFIED,
    confidence: 0,
    evidence: [],
    isExplicit: false,
    policy: 'EXPLICIT_ONLY',
  };
}

export function classifyJobTargetGender(
  title: string,
  description = '',
): TargetGender {
  return classifyJobGender(title, description).targetGender;
}
