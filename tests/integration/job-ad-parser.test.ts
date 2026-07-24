import { parseJobAdContent } from '../../lib/ad-parser/ad-scraper-engine';

describe('Job Ad & Social Leads Parser Integration Tests', () => {
  it('should extract target email, role and reference number from social ad text', () => {
    const text = "مطلوب مشرف إداري بشركة سابك بالرياض إيميل hr@sabic-ksa.com مرجع الوظيفة SAB-2026";
    const result = parseJobAdContent(text, 'X Post');

    expect(result.primaryEmail).toBe('hr@sabic-ksa.com');
    expect(result.jobTitle).toContain('مشرف');
    expect(result.referenceNumber).toBe('SAB-2026');
  });
});
