import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const {
  dedupeLocalRecords,
  detectSourcePlatform,
  extractCompany,
  extractLocations,
  extractTitleCandidates,
  findExplicitTitle,
  meaningfulImageUrl,
  parseCandidateSnapshot,
  parseXSnapshot,
  scanMetrics,
} = require('../src/scanner-content.cjs');

test('detects supported source platforms from the source URL', () => {
  assert.equal(detectSourcePlatform('https://x.com/example/status/1'), 'x');
  assert.equal(
    detectSourcePlatform('https://www.linkedin.com/jobs/view/1'),
    'linkedin',
  );
  assert.equal(
    detectSourcePlatform('https://boards.greenhouse.io/company/jobs/1'),
    'ats',
  );
});

test('extracts explicit job evidence contacts and public job images', () => {
  const record = parseCandidateSnapshot(
    {
      text: `فرصة وظيفية\nالمسمى الوظيفي: مطور تطبيقات Android\nالموقع: الرياض\nللتقديم jobs@example.com`,
      rawText: `فرصة وظيفية\nالمسمى الوظيفي: مطور تطبيقات Android\nالموقع: الرياض\nللتقديم jobs@example.com`,
      titleTexts: [],
      headingTexts: [],
      companyTexts: ['شركة تقنية'],
      locationTexts: ['الرياض'],
      links: [
        {
          href: '/jobs/123',
          text: 'تفاصيل الوظيفة',
        },
        {
          href: 'https://forms.gle/example',
          text: 'التقديم الآن',
        },
      ],
      images: [
        {
          src: 'https://pbs.twimg.com/media/job-ad.jpg',
          alt: 'إعلان وظيفة',
          width: 800,
          height: 600,
        },
        {
          src: 'https://pbs.twimg.com/profile_images/avatar.jpg',
          alt: 'avatar',
          width: 48,
          height: 48,
        },
      ],
    },
    'https://careers.example.com/jobs',
  );

  assert.ok(record);
  assert.equal(record.title, 'مطور تطبيقات Android');
  assert.equal(record.company, 'شركة تقنية');
  assert.equal(record.location, 'الرياض');
  assert.deepEqual(record.emails, ['jobs@example.com']);
  assert.equal(record.applyUrl, 'https://forms.gle/example');
  assert.equal(record.sourceUrl, 'https://careers.example.com/jobs/123');
  assert.deepEqual(record.imageUrls, ['https://pbs.twimg.com/media/job-ad.jpg']);
  assert.equal(record.ocrStatus, 'not_requested');
  assert.equal(record.reviewStatus, 'confirmed');
});

test('X adapter rejects generic intro sentences and splits multiple job titles', () => {
  const text = `We are hiring the following positions to join our team in #Riyadh:
- Office Engineer
- Cost Accountant
- Call Center Representative

Requirements:
3+ years of experience
Apply: jobs@example.com`;

  const titles = extractTitleCandidates(text);
  assert.deepEqual(titles, [
    'Office Engineer',
    'Cost Accountant',
    'Call Center Representative',
  ]);

  const records = parseXSnapshot(
    {
      rawText: text,
      sourceUrl: 'https://x.com/Wdhifaa/status/123456789',
      sourceItemId: '123456789',
      authorName: 'أبو تركي | وظائف',
      authorHandle: '@Wdhifaa',
      publishedAt: '2026-07-25T00:00:00.000Z',
      links: [],
      images: [],
    },
    'https://x.com/Wdhifaa',
  );

  assert.equal(records.length, 3);
  assert.deepEqual(records.map((record) => record.title), titles);
  assert.ok(records.every((record) => record.sourceUrl.endsWith('/status/123456789')));
  assert.ok(records.every((record) => record.location?.includes('Riyadh')));
  assert.ok(records.every((record) => record.emails.includes('jobs@example.com')));
  assert.ok(records.every((record) => record.reviewStatus === 'confirmed'));
});

test('X adapter preserves image-only and incomplete candidates instead of hiding them', () => {
  const records = parseXSnapshot(
    {
      rawText: 'إعلان توظيف جديد، التفاصيل في الصورة.',
      sourceUrl: 'https://x.com/Wdhifaa/status/987654321',
      sourceItemId: '987654321',
      authorName: 'وظائف',
      authorHandle: '@Wdhifaa',
      publishedAt: null,
      links: [],
      images: [
        {
          src: 'https://pbs.twimg.com/media/job-image.jpg',
          alt: '',
          width: 0,
          height: 0,
        },
      ],
    },
    'https://x.com/Wdhifaa',
  );

  assert.equal(records.length, 1);
  assert.equal(records[0].title, null);
  assert.equal(records[0].reviewStatus, 'potential');
  assert.equal(records[0].ocrStatus, 'not_requested');
  assert.equal(records[0].imageUrls.length, 1);
});

test('X adapter extracts company city forms and external application links', () => {
  const text = `تعلن شركة مدار التقنية عن فرصة وظيفية
المسمى الوظيفي: محلل بيانات
المدينة: جدة
للتقديم عبر الرابط`;

  const records = parseXSnapshot(
    {
      rawText: text,
      sourceUrl: 'https://x.com/jobs/status/555',
      sourceItemId: '555',
      authorName: 'وظائف السعودية',
      authorHandle: '@jobs',
      publishedAt: null,
      links: [
        {
          href: 'https://forms.gle/cxhhaRkFHxBUzDPf8',
          expandedUrl: 'https://forms.gle/cxhhaRkFHxBUzDPf8',
          text: 'التقديم عبر الرابط',
        },
      ],
      images: [],
    },
    'https://x.com/jobs',
  );

  assert.equal(records.length, 1);
  assert.equal(records[0].title, 'محلل بيانات');
  assert.equal(records[0].company, 'شركة مدار التقنية');
  assert.ok(records[0].location?.includes('جدة'));
  assert.deepEqual(records[0].forms, ['https://forms.gle/cxhhaRkFHxBUzDPf8']);
  assert.equal(records[0].applyUrl, 'https://forms.gle/cxhhaRkFHxBUzDPf8');
});

test('deduplication preserves separate roles from the same X post and merges repeated snapshots', () => {
  const base = {
    sourceUrl: 'https://x.com/jobs/status/999',
    sourcePlatform: 'x',
    company: null,
    location: 'الرياض',
    description: 'وظائف متعددة',
    applyUrl: null,
    emails: [],
    phones: [],
    forms: [],
    imageUrls: [],
    ocrStatus: 'not_applicable',
    ocrText: null,
    evidence: [],
    detectedAt: '2026-07-25T00:00:00.000Z',
    reviewStatus: 'potential',
    confidence: 0.6,
    rawText: 'وظائف متعددة',
    authorName: null,
    authorHandle: null,
    publishedAt: null,
    sourceItemId: '999',
  };

  const result = dedupeLocalRecords([
    { ...base, title: 'محاسب' },
    { ...base, title: 'مهندس' },
    { ...base, title: 'محاسب', emails: ['jobs@example.com'] },
  ]);

  assert.equal(result.length, 2);
  assert.deepEqual(
    result.find((record) => record.title === 'محاسب')?.emails,
    ['jobs@example.com'],
  );
});

test('scan metrics report every review class', () => {
  const metrics = scanMetrics([
    { reviewStatus: 'confirmed' },
    { reviewStatus: 'potential' },
    { reviewStatus: 'needs_ocr' },
    { reviewStatus: 'incomplete' },
  ]);
  assert.deepEqual(metrics, {
    confirmedCount: 1,
    potentialCount: 1,
    needsOcrCount: 1,
    incompleteCount: 1,
  });
});

test('filters decorative images and keeps meaningful media', () => {
  assert.equal(
    meaningfulImageUrl(
      {
        src: 'https://example.com/icons/logo.png',
        alt: 'logo',
        width: 40,
        height: 40,
      },
      'https://example.com/jobs',
    ),
    null,
  );
  assert.equal(
    meaningfulImageUrl(
      {
        src: 'https://pbs.twimg.com/media/abc.jpg',
        alt: '',
        width: 0,
        height: 0,
      },
      'https://x.com/jobs/status/1',
    ),
    'https://pbs.twimg.com/media/abc.jpg',
  );
});

test('leaves unknown fields null and rejects unrelated cards', () => {
  assert.equal(
    parseCandidateSnapshot(
      {
        text: 'خبر عام لا يتعلق بالتوظيف أو التقديم.',
        rawText: 'خبر عام لا يتعلق بالتوظيف أو التقديم.',
        titleTexts: [],
        headingTexts: [],
        companyTexts: [],
        locationTexts: [],
        links: [],
        images: [],
      },
      'https://example.com/news',
    ),
    null,
  );

  const title = findExplicitTitle('مطلوب - محاسب تكاليف\nالمدينة جدة');
  assert.equal(title, 'محاسب تكاليف');
  assert.equal(extractCompany('تعلن شركة الحلول الرقمية عن وظائف جديدة'), 'شركة الحلول الرقمية');
  assert.ok(extractLocations('مقر العمل: الرياض').includes('الرياض'));
});
