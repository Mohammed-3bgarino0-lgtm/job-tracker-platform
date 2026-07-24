import { describe, expect, it } from 'vitest';
import {
  calculateOverallConfidence,
  parseResumeText,
} from './index';

describe('parseResumeText', () => {
  it('extracts explicit Arabic contact and career data', () => {
    const data = parseResumeText(`
الاسم الكامل: محمد أحمد السكران
المسمى الوظيفي: مدير عمليات
البريد الإلكتروني: mohammed@example.com
رقم الجوال: 055 123 4567
المدينة: الرياض
الجنسية: سعودي
خبرة 8 سنوات

الملخص المهني
مدير عمليات متخصص في تطوير الإجراءات وتحسين جودة الخدمات.

المهارات
إدارة المشاريع، تحليل البيانات، SAP

الخبرة العملية
مدير عمليات | شركة المثال
2018 - حتى الآن
تطوير العمليات والإشراف على الفريق.

التعليم
بكالوريوس في إدارة الأعمال
جامعة الملك سعود
GPA: 4.2/5
`);

    expect(data.personalInfo.firstName.value).toBe('محمد');
    expect(data.personalInfo.lastName.value).toBe('السكران');
    expect(data.personalInfo.email.value).toBe('mohammed@example.com');
    expect(data.personalInfo.phone.value).toBe('+966551234567');
    expect(data.personalInfo.city.value).toBe('الرياض');
    expect(data.careerInfo.totalYearsExperience.value).toBe(8);
    expect(data.skills.map((skill) => skill.name)).toContain('SAP');
    expect(calculateOverallConfidence(data)).toBeGreaterThan(0);
  });

  it('keeps absent values null instead of inventing defaults', () => {
    const data = parseResumeText('المهارات\nTypeScript، Kotlin');

    expect(data.personalInfo.email.value).toBeNull();
    expect(data.personalInfo.phone.value).toBeNull();
    expect(data.personalInfo.city.value).toBeNull();
    expect(data.careerInfo.totalYearsExperience.value).toBeNull();
    expect(data.skills).toHaveLength(2);
  });

  it('returns zero overall confidence when no scalar field exists', () => {
    const data = parseResumeText('');
    expect(calculateOverallConfidence(data)).toBe(0);
  });
});
