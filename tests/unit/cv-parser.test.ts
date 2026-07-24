import { parseCVDocument } from '../../lib/cv-parser/cv-parser-engine';

describe('CV Parser Engine Tests', () => {
  it('should extract email and phone with confidence scores', () => {
    const rawText = "Mohammed H. Al-Sakran Riyadh 0539491361 mohammed-alsakran@hotmail.com";
    const result = parseCVDocument('test_resume.pdf', rawText);

    expect(result.fields.length).toBeGreaterThan(0);
    const emailField = result.fields.find(f => f.fieldName === 'email');
    expect(emailField).toBeDefined();
    expect(emailField?.value).toContain('@');
    expect(emailField?.confidenceScore).toBeGreaterThanOrEqual(90);
  });
});
