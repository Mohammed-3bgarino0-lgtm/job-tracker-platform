# Qaddem AI — Product Foundation

## Product objective

Qaddem AI is a user-controlled job discovery, application assistance, and application tracking platform. It is not a fully autonomous applicant and does not submit applications without the user.

## Core user journey

1. Create an account and secure session.
2. Upload a PDF or DOCX resume.
3. Review and approve every extracted value.
4. Complete the unified career profile.
5. Define job titles, locations, sources, and notification preferences.
6. Discover jobs from supported official sources, company career pages, public posts, and user-shared links.
7. Normalize and deduplicate job records while retaining original sources.
8. Explain match results using approved profile data only.
9. Build an application package with a selected resume and approved answers.
10. Assist with form filling while leaving unknown values empty.
11. Let the user review and perform final submission.
12. Record the application only after user confirmation or reliable submission evidence.

## Zero Dummy Data policy

- Unknown values are `null` or absent.
- Empty product states do not display fabricated jobs, users, companies, scores, or activity.
- Gender targeting is classified only from explicit advertisement language.
- Skills, experience, education, and answers are never inferred as facts without user approval.
- A job application is never marked as submitted without confirmation or reliable evidence.

## Initial web routes

| Route | Purpose |
| --- | --- |
| `/` | Public product introduction and usage journey |
| `/dashboard` | Onboarding, job discovery summary, and application summary |
| `/jobs` | Unified job search and normalized results |
| `/applications` | Application status board and timeline |
| `/resume` | Resume upload, extraction, review, and approval |
| `/profile` | Unified personal and career profile |
| `/searches` | Saved searches and job alerts |
| `/devices` | Browser extension and mobile device connections |
| `/settings` | Privacy, consent, security, and data controls |

## Product boundaries

- No CAPTCHA, OTP, or Nafath bypass.
- No hidden crawling behind authenticated sessions.
- No final form submission without the user.
- No automatic exclusion or ranking based on inferred gender.
- No use of sensitive fields without explicit approval.
- No claim that official sources provide an API until verified and integrated.

## Deployment gate

The public domain must not be switched to the new application until all of the following are true:

1. Dependency installation succeeds in CI.
2. Prisma schema validation and client generation succeed.
3. TypeScript checks and automated tests succeed.
4. The production Next.js build succeeds.
5. A server-capable preview deployment is reviewed on desktop and mobile.
6. PostgreSQL and required environment variables are configured.
7. The existing public site remains available until the replacement passes a smoke test.

## Next implementation order

1. CI validation and merge of resume parsing foundation.
2. Authentication, sessions, and consent enforcement.
3. Persisted career profile and resume storage.
4. Website–extension secure bridge.
5. Job source connector framework.
6. Job normalization and deduplication.
7. Explainable matching.
8. Safe form mapping and autofill review.
9. Application tracking and notifications.
10. Android and iOS clients on the shared backend.
