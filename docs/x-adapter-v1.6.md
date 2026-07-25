# X Adapter v1.6 — Comprehensive Results and Review Safety

## Goal

The scanner must maximize recall without presenting weak extraction as verified data.

It therefore keeps every job-related X post loaded during the scan and assigns one of four review states:

- `confirmed`: a structured title plus strong job/application evidence.
- `potential`: job evidence exists, but one or more core fields need review.
- `needs_ocr`: the useful content is primarily inside an image.
- `incomplete`: the post is retained because it may be relevant, but structured evidence is insufficient.

No candidate is silently deleted because its company, city, title, email, or form is missing.

## X-specific extraction

The adapter reads each `article[data-testid="tweet"]` independently and uses:

- `[data-testid="tweetText"]` for the post text.
- The `<time>` link for the permanent `/status/{id}` URL.
- `[data-testid="User-Name"]` for publisher name and handle.
- `[data-testid="tweetPhoto"]` and `pbs.twimg.com/media` for public post images.
- Tweet and card links for application URLs.

Engagement counts, navigation, suggested accounts, and sidebars are not included in the post text.

## Comprehensive scrolling

The scanner:

1. Starts at the top of an X profile page.
2. Collects visible posts before scrolling.
3. Collects again after every scroll round.
4. Keeps records from previous rounds even when X removes old DOM nodes through virtualization.
5. Uses up to 24 rounds for deep/current-page scanning.
6. Reports `partial` or `truncated` when the scan reaches a time, round, or result limit.

An X profile can be effectively infinite. “All results” means all posts loaded during the declared scan window, not the full historical archive of the account.

## Multi-role posts

A single post may create multiple records when it clearly lists several roles. Deduplication uses:

`permanent post URL + normalized job title`

This prevents “Accountant” and “Engineer” from the same post from being merged.

## Zero Dummy Data

Unknown values remain `null` or empty lists. The adapter never invents:

- company
- city
- title
- application URL
- email
- phone
- publish date

## Export

Excel export includes all review states, confidence, publisher, publish date, raw text, application methods, source URL, images, and OCR status.
