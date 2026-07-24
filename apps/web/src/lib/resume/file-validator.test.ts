import { describe, expect, it } from 'vitest';
import {
  ResumeFileValidationError,
  validateResumeFile,
} from './file-validator';

describe('validateResumeFile', () => {
  it('accepts a PDF only when MIME and signature match', () => {
    const file = new File(['%PDF-1.7'], 'resume.pdf', {
      type: 'application/pdf',
    });
    const result = validateResumeFile(
      file,
      Buffer.from('%PDF-1.7'),
    );
    expect(result).toBe('pdf');
  });

  it('rejects a spoofed PDF MIME type', () => {
    const file = new File(['not-a-pdf'], 'resume.pdf', {
      type: 'application/pdf',
    });

    expect(() =>
      validateResumeFile(file, Buffer.from('not-a-pdf')),
    ).toThrow(ResumeFileValidationError);
  });
});
