import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const {
  detectSourcePlatform,
  findExplicitTitle,
  parseCandidateSnapshot,
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

test('extracts explicit job evidence and confirmed contact methods', () => {
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
      },
      'https://example.com/news',
    ),
    null,
  );

  const title = findExplicitTitle('مطلوب - محاسب تكاليف\nالمدينة جدة');
  assert.equal(title, 'محاسب تكاليف');
});
