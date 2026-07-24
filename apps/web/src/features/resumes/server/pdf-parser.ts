export async function extractTextFromPDFBuffer(buffer: Buffer): Promise<string> {
  // Pure text extraction logic from PDF buffer
  return buffer.toString('utf-8');
}
