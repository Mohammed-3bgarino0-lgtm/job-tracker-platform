import * as mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

const EXTRACTION_TIMEOUT_MS = 20_000;

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error('انتهت مهلة قراءة ملف السيرة.'));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await withTimeout(
      parser.getText(),
      EXTRACTION_TIMEOUT_MS,
    );
    return result.text;
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await withTimeout(
    mammoth.extractRawText({ buffer }),
    EXTRACTION_TIMEOUT_MS,
  );

  return result.value;
}

export async function extractRawResumeText(
  buffer: Buffer,
  fileType: 'pdf' | 'docx',
): Promise<string> {
  const text =
    fileType === 'pdf'
      ? await extractPdfText(buffer)
      : await extractDocxText(buffer);

  return text
    .replace(/\u0000/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
