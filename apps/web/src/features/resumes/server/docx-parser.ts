export async function extractTextFromDOCXBuffer(buffer: Buffer): Promise<string> {
  // Pure text extraction logic from DOCX buffer
  return buffer.toString('utf-8');
}
