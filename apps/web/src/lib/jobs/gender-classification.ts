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

export function buildGenderClassification(
  title: string,
  description: string | null,
): {
  result: GenderClassificationResult;
  persistence: PersistedGenderClassification;
} {
  const result = classifyJobGender(title, description ?? '');
  const isUnspecified = result.targetGender === TargetGender.UNSPECIFIED;

  return {
    result,
    persistence: {
      genderTarget: isUnspecified ? null : result.targetGender,
      genderConfidence: isUnspecified ? null : result.confidence,
      genderEvidence: result.evidence,
      genderClassifiedAt: result.isExplicit ? new Date() : null,
    },
  };
}
