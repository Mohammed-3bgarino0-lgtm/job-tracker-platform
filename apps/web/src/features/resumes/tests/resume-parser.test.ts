import { parseRawResumeText } from '../server/resume-parser';

describe('Resume Parser Engine Tests', () => {
  it('should extract email and phone accurately without dummy fallbacks', () => {
    const rawText = "Mohammed AlSakran Riyadh 0539491361 mohammed-alsakran@hotmail.com";
    const res = parseRawResumeText('cv.pdf', rawText);

    expect(res.fields.length).toBeGreaterThan(0);
    const emailField = res.fields.find(f => f.fieldName === 'email');
    expect(emailField).toBeDefined();
    expect(emailField?.fieldValue).toBe('mohammed-alsakran@hotmail.com');
  });

  it('should return empty fields if no email or phone present (Zero Dummy Data)', () => {
    const rawText = "قالب فارغ بدون وسائل تواصل";
    const res = parseRawResumeText('empty.pdf', rawText);

    expect(res.fields.length).toBe(0);
  });
});
