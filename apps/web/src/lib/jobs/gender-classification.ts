import {
  TargetGender,
  classifyJobGender,
  type GenderClassificationResult,
} from '@qaddem/shared';

export interface PersistedGenderClassification {
  genderTarget: 'MALE' | 'FEMALE' | 'BOTH' | null;
  genderConfidence: number | null;
  genderEvidence: string[];
  genderClassifiedAt: Date | null;
}

function toPersistedGenderTarget(
  targetGender: TargetGender,
): PersistedGenderClassification['genderTarget'] {
  switch (targetGender) {
    case TargetGender.MALE:
      return 'MALE';
    case TargetGender.FEMALE:
      return 'FEMALE';
    case TargetGender.BOTH:
      return 'BOTH';
    case TargetGender.UNSPECIFIED:
      return null;
  }
}

export function buildGenderClassification(
  title: string,
  description: string | null,
): {
  result: GenderClassificationResult;
  persistence: PersistedGenderClassification;
} {
  const result = classifyJobGender(title, description ?? '');
  const genderTarget = toPersistedGenderTarget(result.targetGender);
  const hasExplicitTarget = genderTarget !== null && result.isExplicit;

  return {
    result,
    persistence: {
      genderTarget,
      genderConfidence: hasExplicitTarget ? result.confidence : null,
      genderEvidence: hasExplicitTarget ? result.evidence : [],
      genderClassifiedAt: hasExplicitTarget ? new Date() : null,
    },
  };
}
