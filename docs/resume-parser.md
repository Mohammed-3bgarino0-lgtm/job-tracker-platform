# Resume Parsing Engine and Review UI

## Data flow

1. The client uploads a PDF or DOCX and supplies an existing user ID.
2. The API validates size, MIME type, and file signature.
3. Text is extracted in memory:
   - `pdf-parse` for PDF.
   - `mammoth.extractRawText` for DOCX.
4. The deterministic parser extracts only values explicitly found in text.
5. Missing values remain `null` with confidence `0`.
6. The unreviewed result is stored in `ResumeExtraction.parsedData`.
7. The user reviews scalar fields and collections.
8. Approval replaces the normalized career-profile collections and records:
   - `ConsentLog`
   - `AuditLog`
   - review timestamp and reviewer user ID

## Security and privacy decisions

- Maximum upload size: 10 MB.
- Accepted formats: PDF and DOCX.
- MIME type must match the file signature.
- PDF/DOCX text extraction has a 20-second timeout.
- Uploaded bytes are not persisted in this phase.
- DOCX is converted to raw text only; generated HTML is never embedded.
- Image-only resumes return `OCR_REQUIRED`.
- No default names, cities, emails, phone numbers, companies, or dates exist.

## Authentication gap

The current monorepo does not yet contain an authentication layer. The API therefore requires an explicit `userId` and verifies ownership of the extraction. Replace this temporary contract with the authenticated session identity before production deployment.

## Local commands

```bash
corepack enable
pnpm install
pnpm db:validate
pnpm typecheck
pnpm test
pnpm dev
```
