import { describe, expect, it } from 'vitest';
import {
  QADDEM_BRIDGE_MESSAGE_TYPES,
  QADDEM_BRIDGE_PROTOCOL,
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
    evidence: ['مطور تطبيقات'],
    detectedAt: '2026-07-24T00:00:00.000Z',
    ...overrides,
  };
}

describe('website-extension bridge contract', () => {
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

  it('validates the request envelope and scan depth', () => {
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
        requestId: 'short',
        command: 'SCAN_URL',
        payload: {
          url: 'https://example.com/jobs',
          depth: 'unbounded',
        },
      }),
    ).toBe(false);
  });

  it('uses bounded scan rounds', () => {
    expect(scanRoundsForDepth('quick')).toBe(4);
    expect(scanRoundsForDepth('balanced')).toBe(7);
    expect(scanRoundsForDepth('deep')).toBe(12);
  });

  it('deduplicates matching jobs and preserves confirmed contacts', () => {
    const result = dedupeJobRecords([
      job({ emails: ['jobs@example.com'] }),
      job({
        sourceUrl: 'https://example.com/jobs/1?utm_source=x',
        applyUrl: 'https://example.com/apply/1?utm_source=x',
        phones: ['0500000000'],
        description: 'وصف مؤكد أطول من النسخة الأولى للإعلان الوظيفي.',
      }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]?.emails).toEqual(['jobs@example.com']);
    expect(result[0]?.phones).toEqual(['0500000000']);
    expect(result[0]?.description).toContain('أطول');
  });
});
