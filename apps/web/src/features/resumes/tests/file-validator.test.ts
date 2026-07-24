import { validateResumeFile } from '../server/file-validator';

describe('File Validator Server Tests', () => {
  it('should validate allowed PDF file under 10MB', () => {
    const res = validateResumeFile(2 * 1024 * 1024, 'application/pdf');
    expect(res.isValid).toBe(true);
  });

  it('should reject file over 10MB', () => {
    const res = validateResumeFile(12 * 1024 * 1024, 'application/pdf');
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('تتجاوز الحد الأقصى');
  });
});
