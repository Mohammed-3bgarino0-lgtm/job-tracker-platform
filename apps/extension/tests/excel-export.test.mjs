import assert from 'node:assert/strict';
import test from 'node:test';
import { buildExcelXml } from '../src/lib/excel-export.js';

test('builds an RTL Excel-compatible worksheet with job fields', () => {
  const xml = buildExcelXml([
    {
      title: 'محلل بيانات',
      company: 'شركة مثال',
      location: 'الرياض',
      description: 'وصف الإعلان',
      emails: ['jobs@example.com'],
      phones: ['0500000000'],
      forms: ['https://forms.gle/example'],
      applyUrl: 'https://example.com/apply',
      sourceUrl: 'https://x.com/example/status/1',
      sourcePlatform: 'x',
      imageUrls: ['https://pbs.twimg.com/media/job.jpg'],
      ocrStatus: 'complete',
      ocrText: 'نص مستخرج',
      detectedAt: '2026-07-25T00:00:00.000Z',
    },
  ]);

  assert.match(xml, /Excel\.Sheet/);
  assert.match(xml, /DisplayRightToLeft/);
  assert.match(xml, /محلل بيانات/);
  assert.match(xml, /jobs@example\.com/);
  assert.match(xml, /نص مستخرج/);
});
