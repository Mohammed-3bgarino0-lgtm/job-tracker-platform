import {
  TargetGender,
  type GenderClassificationResult,
} from '@qaddem/shared';

export type UserGender = 'MALE' | 'FEMALE' | null;

export type GenderMatchStatus =
  | 'MATCH'
  | 'MISMATCH_REVIEW'
  | 'NOT_APPLICABLE'
  | 'USER_GENDER_UNKNOWN';

export interface GenderMatchResult {
  status: GenderMatchStatus;
  isMatch: boolean | null;
  userGender: UserGender;
  jobTargetGender: TargetGender;
  evidence: string[];
  confidence: number;
  requiresAcknowledgement: boolean;
  canProceed: true;
  warningMessage: string | null;
}

const targetLabels: Record<TargetGender, string> = {
  [TargetGender.MALE]: 'للرجال فقط',
  [TargetGender.FEMALE]: 'للنساء فقط',
  [TargetGender.BOTH]: 'للجنسين',
  [TargetGender.UNSPECIFIED]: 'غير محدد صراحة',
};

export function checkGenderMatch(
  userGender: UserGender,
  classification: GenderClassificationResult,
  jobTitle: string,
): GenderMatchResult {
  const base = {
    userGender,
    jobTargetGender: classification.targetGender,
    evidence: classification.evidence,
    confidence: classification.confidence,
    canProceed: true as const,
  };

  if (!userGender) {
    return {
      ...base,
      status: 'USER_GENDER_UNKNOWN',
      isMatch: null,
      requiresAcknowledgement: false,
      warningMessage: null,
    };
  }

  if (
    classification.targetGender === TargetGender.UNSPECIFIED ||
    !classification.isExplicit
  ) {
    return {
      ...base,
      status: 'NOT_APPLICABLE',
      isMatch: null,
      requiresAcknowledgement: false,
      warningMessage: null,
    };
  }

  if (classification.targetGender === TargetGender.BOTH) {
    return {
      ...base,
      status: 'MATCH',
      isMatch: true,
      requiresAcknowledgement: false,
      warningMessage: null,
    };
  }

  if (classification.targetGender === userGender) {
    return {
      ...base,
      status: 'MATCH',
      isMatch: true,
      requiresAcknowledgement: false,
      warningMessage: null,
    };
  }

  return {
    ...base,
    status: 'MISMATCH_REVIEW',
    isMatch: false,
    requiresAcknowledgement: true,
    warningMessage:
      `يذكر الإعلان صراحة أنه ${targetLabels[classification.targetGender]} ` +
      `للمسمى «${jobTitle}»، بينما ملفك يحتوي جنسًا مختلفًا. ` +
      'راجع نص الإعلان قبل المتابعة. لن تمنعك المنصة من اتخاذ القرار النهائي.',
  };
}
