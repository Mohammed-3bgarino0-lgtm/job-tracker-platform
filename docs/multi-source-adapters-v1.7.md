# Multi-source Job Adapters v1.7

## Supported source families

- Google Search and visible Google job result cards.
- X posts through the dedicated X adapter.
- LinkedIn job lists and opened job details.
- Indeed job result cards and opened job pages.
- Bayt result cards and job details.
- Jadarat visible job cards after the user signs in when required.
- ATS pages: Greenhouse, Lever, Workday, SuccessFactors, Oracle Recruiting, SmartRecruiters and Recruitee.
- Generic corporate career pages.

## Accuracy and completeness rules

1. The extension scans only after an explicit user action.
2. Results are accumulated before scrolling and after every bounded scroll round.
3. A missing title, company or city remains null; the record is not fabricated.
4. Weak records are preserved with a review status instead of being silently deleted.
5. Search-engine redirect links are unwrapped before storage when possible.
6. Multiple roles from one X post remain separate records.
7. Duplicate snapshots are merged by canonical source URL and role title.
8. The scan reports `partial` and `truncated` honestly when it stops because of time, rounds or limits.
9. Login, CAPTCHA, OTP and national-access steps are never bypassed.
10. The extension never submits an application.

## Review states

- `confirmed`: title plus strong evidence, contact or a job URL.
- `potential`: some job evidence exists but manual review is required.
- `needs_ocr`: the useful information appears to be inside a public image.
- `incomplete`: retained evidence is not enough to structure a complete job.

## Bounded scan limits

- Quick: 6 rounds.
- Balanced: 12 rounds.
- Deep: 24 rounds.
- Maximum structured results per scan: 400.
- Maximum OCR candidates per request: 12.

These limits protect browser performance. A dynamic or paginated source may require another scan to retrieve a later batch.
