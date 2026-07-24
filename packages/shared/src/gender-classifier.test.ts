import { describe, expect, it } from 'vitest';
import {
  classifyJobGender,
  TargetGender,
} from './gender-classifier';

describe('classifyJobGender', () => {
  it('classifies explicit women-only wording', () => {
    const result = classifyJobGender(
      'أخصائي خدمة عملاء',
      'الفرصة مخصصة للنساء فقط في مدينة الرياض.',
    );

    expect(result.targetGender).toBe(TargetGender.FEMALE);
    expect(result.isExplicit).toBe(true);
    expect(result.evidence.length).toBeGreaterThan(0);
  });

  it('classifies explicit men-only wording', () => {
    const result = classifyJobGender(
      'ممثل مبيعات',
      'مطلوب موظفين رجال للعمل الميداني.',
    );

    expect(result.targetGender).toBe(TargetGender.MALE);
  });

  it('classifies explicit both-genders wording', () => {
    const result = classifyJobGender(
      'محلل بيانات',
      'الوظيفة متاحة للجنسين رجال ونساء.',
    );

    expect(result.targetGender).toBe(TargetGender.BOTH);
  });

  it('does not infer gender from a gendered job title', () => {
    expect(classifyJobGender('محاسبة').targetGender).toBe(
      TargetGender.UNSPECIFIED,
    );
    expect(classifyJobGender('مهندس موقع').targetGender).toBe(
      TargetGender.UNSPECIFIED,
    );
  });

  it('returns unspecified when no explicit evidence exists', () => {
    const result = classifyJobGender(
      'مطور تطبيقات',
      'خبرة في TypeScript وواجهات الويب.',
    );

    expect(result.targetGender).toBe(TargetGender.UNSPECIFIED);
    expect(result.confidence).toBe(0);
    expect(result.evidence).toEqual([]);
  });
});
