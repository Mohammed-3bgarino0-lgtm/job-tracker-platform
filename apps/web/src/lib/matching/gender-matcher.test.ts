import {
  classifyJobGender,
  TargetGender,
} from '@qaddem/shared';
import { describe, expect, it } from 'vitest';
import { checkGenderMatch } from './gender-matcher';

describe('checkGenderMatch', () => {
  it('matches an explicitly compatible opportunity', () => {
    const result = checkGenderMatch(
      'FEMALE',
      classifyJobGender('خدمة عملاء', 'مخصصة للنساء فقط'),
      'خدمة عملاء',
    );

    expect(result.status).toBe('MATCH');
    expect(result.isMatch).toBe(true);
  });

  it('returns a review warning without blocking user choice', () => {
    const result = checkGenderMatch(
      'MALE',
      classifyJobGender('خدمة عملاء', 'مخصصة للنساء فقط'),
      'خدمة عملاء',
    );

    expect(result.status).toBe('MISMATCH_REVIEW');
    expect(result.requiresAcknowledgement).toBe(true);
    expect(result.canProceed).toBe(true);
    expect(result.warningMessage).toContain('لن تمنعك المنصة');
  });

  it('does not claim a match when the advertisement is unspecified', () => {
    const result = checkGenderMatch(
      'MALE',
      classifyJobGender('مهندس موقع'),
      'مهندس موقع',
    );

    expect(result.jobTargetGender).toBe(TargetGender.UNSPECIFIED);
    expect(result.status).toBe('NOT_APPLICABLE');
    expect(result.isMatch).toBeNull();
  });
});
