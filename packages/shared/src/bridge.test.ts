import { describe, expect, it } from 'vitest';
import {
  QADDEM_BRIDGE_MESSAGE_TYPES,
  QADDEM_BRIDGE_PROTOCOL,
  QADDEM_EXTENSION_VERSION,
  QADDEM_PRIMARY_WEB_ORIGIN,
  dedupeJobRecords,
  isAllowedWebsiteOrigin,
  isBridgeRequestMessage,
  parseSafeScanUrl,
  scanRoundsForDepth,
  type JobScanRecord,
} from './bridge';

function job(overrides: Partial<JobScanRecord> = {}): JobScanRecord {
  return {
    sourceUrl: 'https://example.com/jobs/1',
    sourcePlatform: 'company',
    title: 'مطور تطبيقات',
    company: 'شركة مثال',
    location: 'الرياض',
    description: 'وصف مؤكد من الإعلان.',
    applyUrl: 'https://example.com/apply/1',
    emails: [],
    phones: [],
    forms: [],
    imageUrls: [],
    ocrStatus: 'not_applicable',
    ocrText: null,
    evidence: ['مطور تطبيقات'],
    detectedAt: '2026-07-24T00:00:00.000Z',
    reviewStatus: 'confirmed',
    confidence: 0.9,
    rawText: 'مطور تطبيقات',
    authorName: null,
    authorHandle: null,
    publishedAt: null,
    sourceItemId: null,
    ...overrides,
  };
}

describe('website-extension bridge contract', () => {
  it('publishes the v1.7 primary website origin and comprehensive scan depths', () => {
    expect(QADDEM_EXTENSION_VERSION).toBe('1.7.0');
    expect(QADDEM_PRIMARY_WEB_ORIGIN).toBe(
      'https://qaddemweb-production.up.railway.app',
    );
    expect(scanRoundsForDepth('quick')).toBe(6);
    expect(scanRoundsForDepth('balanced')).toBe(12);
    expect(scanRoundsForDepth('deep')).toBe(24);
  });

  it('accepts only exact allowlisted website origins', () => {
    expect(isAllowedWebsiteOrigin('https://haderksa.org')).toBe(true);
    expect(
      isAllowedWebsiteOrigin('https://qaddemweb-production.up.railway.app'),
    ).toBe(true);
    expect(isAllowedWebsiteOrigin('https://evil.example')).toBe(false);
  });

  it('rejects unsafe and private scan URLs', () => {
    expect(parseSafeScanUrl('javascript:alert(1)')).toBeNull();
    expect(parseSafeScanUrl('http://127.0.0.1/admin')).toBeNull();
    expect(parseSafeScanUrl('http://192.168.1.10/jobs')).toBeNull();
    expect(parseSafeScanUrl('https://user:pass@example.com/jobs')).toBeNull();
    expect(parseSafeScanUrl('https://example.com/jobs#section')?.hash).toBe('');
  });

  it('validates scan and last-scan import requests', () => {
    expect(
      isBridgeRequestMessage({
        messageType: QADDEM_BRIDGE_MESSAGE_TYPES.request,
        protocol: QADDEM_BRIDGE_PROTOCOL,
        requestId: 'request_12345678',
        command: 'SCAN_URL',
        payload: {
          url: 'https://example.com/jobs',
          depth: 'balanced',
        },
      }),
    ).toBe(true);

    expect(
      isBridgeRequestMessage({
        messageType: QADDEM_BRIDGE_MESSAGE_TYPES.request,
        protocol: QADDEM_BRIDGE_PROTOCOL,
        requestId: 'import_12345678',
        command: 'GET_LAST_SCAN',
      }),
    ).toBe(true);

    expect(
      isBridgeRequestMessage({
        messageType: QADDEM_BRIDGE_MESSAGE_TYPES.request,
        protocol: QADDEM_BRIDGE_PROTOCOL,
        requestId: 'short',
        command: 'SCAN_URL',
        payload: {
          url: 'https://example.com/jobs',
          depth: 'unbounded',
        },
      }),
    ).toBe(false);
  });

  it('deduplicates matching jobs and preserves contacts images OCR and review metadata', () => {
    const result = dedupeJobRecords([
      job({
        emails: ['jobs@example.com'],
        imageUrls: ['https://images.example.com/job.jpg'],
        ocrStatus: 'not_requested',
        reviewStatus: 'potential',
        confidence: 0.65,
      }),
      job({
        sourceUrl: 'https://example.com/jobs/1?utm_source=x',
        applyUrl: 'https://example.com/apply/1?utm_source=x',
        phones: ['0500000000'],
        description: 'وصف مؤكد أطول من النسخة الأولى للإعلان الوظيفي.',
        imageUrls: ['https://images.example.com/job-2.jpg'],
        ocrStatus: 'complete',
        ocrText: 'نص مستخرج من الصورة',
        reviewStatus: 'confirmed',
        confidence: 0.91,
      }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]?.emails).toEqual(['jobs@example.com']);
    expect(result[0]?.phones).toEqual(['0500000000']);
    expect(result[0]?.description).toContain('أطول');
    expect(result[0]?.imageUrls).toHaveLength(2);
    expect(result[0]?.ocrStatus).toBe('complete');
    expect(result[0]?.ocrText).toContain('مستخرج');
    expect(result[0]?.reviewStatus).toBe('confirmed');
    expect(result[0]?.confidence).toBe(0.91);
  });

  it('keeps multiple roles from one X post as separate results', () => {
    const first = job({
      sourcePlatform: 'x',
      sourceUrl: 'https://x.com/jobs/status/123',
      applyUrl: 'https://example.com/apply',
      title: 'محاسب',
    });
    const second = job({
      sourcePlatform: 'x',
      sourceUrl: 'https://x.com/jobs/status/123',
      applyUrl: 'https://example.com/apply',
      title: 'مهندس',
    });

    expect(dedupeJobRecords([first, second])).toHaveLength(2);
  });
});
