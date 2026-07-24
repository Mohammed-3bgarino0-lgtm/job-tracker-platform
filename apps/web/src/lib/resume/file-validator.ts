const PDF_MIME = 'application/pdf';
const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export const SUPPORTED_RESUME_MIME_TYPES = [PDF_MIME, DOCX_MIME] as const;
export const MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024;

export class ResumeFileValidationError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = 'ResumeFileValidationError';
  }
}

function hasPdfSignature(buffer: Buffer): boolean {
  return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
}

function hasZipSignature(buffer: Buffer): boolean {
  return (
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    [0x03, 0x05, 0x07].includes(buffer[2]) &&
    [0x04, 0x06, 0x08].includes(buffer[3])
  );
}

export function validateResumeFile(
  file: File,
  buffer: Buffer,
): 'pdf' | 'docx' {
  if (file.size === 0 || buffer.length === 0) {
    throw new ResumeFileValidationError('ملف السيرة فارغ.');
  }

  if (file.size > MAX_RESUME_FILE_SIZE) {
    throw new ResumeFileValidationError(
      'حجم السيرة يتجاوز الحد المسموح وهو 10 ميجابايت.',
      413,
    );
  }

  if (file.type === PDF_MIME && hasPdfSignature(buffer)) {
    return 'pdf';
  }

  if (file.type === DOCX_MIME && hasZipSignature(buffer)) {
    return 'docx';
  }

  throw new ResumeFileValidationError(
    'صيغة الملف غير مدعومة. الصيغ المقبولة هي PDF وDOCX فقط.',
    415,
  );
}
