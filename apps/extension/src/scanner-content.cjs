(function initializeScanner(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.__QADDEM_SCANNER_INTERNALS__ = api;
  api.installRuntimeListener();
})(globalThis, function createScanner() {
  const JOB_SIGNAL_PATTERN =
    /(?:وظيف|شاغر|توظيف|مطلوب|فرصة\s+عمل|career|vacanc|hiring|job|apply)/iu;
  const NON_JOB_CONTEXT_PATTERN =
    /(?:لا\s+يتعلق\s+(?:ب|بـ)?\s*(?:التوظيف|الوظائف|التقديم)|ليس\s+(?:هذا\s+)?(?:إعلان\s+)?(?:وظيفة|فرصة\s+عمل)|not\s+(?:a\s+)?(?:job|vacancy|hiring)\b)/iu;
  const APPLY_TEXT_PATTERN =
    /(?:تقديم|قدّم|قدم الآن|التقديم|apply|easy apply|submit application)/iu;
  const JOB_URL_PATTERN =
    /(?:\/status\/\d+|\/jobs?\/view\/|\/jobs?\/|\/careers?\/|\/vacanc(?:y|ies)\/)/i;
  const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const PHONE_PATTERN =
    /(?:\+?9665|05|\+?967|\+?971|\+?965|\+?968|\+?973)[0-9\s-]{7,12}/g;
  const FORM_PATTERN =
    /https?:\/\/(?:docs\.google\.com\/forms|forms\.gle|(?:www\.)?typeform\.com)\/[^\s]+/gi;
  const FORM_URL_PATTERN =
    /^https?:\/\/(?:docs\.google\.com\/forms|forms\.gle|(?:www\.)?typeform\.com)\//i;
  const cancelledRequests = new Set();

  function normalizeText(value) {
    return String(value ?? '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function clip(value, maxLength) {
    const normalized = normalizeText(value);
    if (!normalized) return null;
    return normalized.length > maxLength
      ? `${normalized.slice(0, maxLength - 1)}…`
      : normalized;
  }

  function unique(values) {
    return Array.from(
      new Set((values ?? []).map((value) => normalizeText(value)).filter(Boolean)),
    );
  }

  function hasPositiveJobSignal(value) {
    const text = normalizeText(value);
    return JOB_SIGNAL_PATTERN.test(text) && !NON_JOB_CONTEXT_PATTERN.test(text);
  }

  function absoluteUrl(value, baseUrl) {
    try {
      const parsed = new URL(value, baseUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) return null;
      parsed.hash = '';
      return parsed.toString();
    } catch {
      return null;
    }
  }

  function detectSourcePlatform(input) {
    try {
      const hostname = new URL(input).hostname.toLowerCase();
      if (
        hostname === 'x.com' ||
        hostname.endsWith('.x.com') ||
        hostname.includes('twitter.com')
      ) {
        return 'x';
      }
      if (hostname.includes('linkedin.com')) return 'linkedin';
      if (
        hostname.includes('greenhouse.io') ||
        hostname.includes('lever.co') ||
        hostname.includes('workdayjobs.com') ||
        hostname.includes('myworkdayjobs.com') ||
        hostname.includes('successfactors.com') ||
        hostname.includes('oraclecloud.com')
      ) {
        return 'ats';
      }
      return 'company';
    } catch {
      return 'unknown';
    }
  }

  function findExplicitTitle(text) {
    const normalized = String(text ?? '');
    const patterns = [
      /(?:المسمى\s+الوظيفي|الوظيفة|شاغر(?:\s+وظيفي)?|مطلوب(?:\s+للتوظيف)?)[\s:：\-–—]+([^\n|•]{2,140})/iu,
      /(?:job\s+title|position|hiring\s+for|vacancy)[\s:：\-–—]+([^\n|•]{2,140})/iu,
    ];

    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      const value = clip(match?.[1], 180);
      if (value) return value;
    }

    return null;
  }

  function chooseLink(links, pattern) {
    return (
      links.find((link) => pattern.test(`${link.text} ${link.href}`))?.href ?? null
    );
  }

  function parseCandidateSnapshot(snapshot, pageUrl) {
    const text = normalizeText(snapshot.text);
    const links = (snapshot.links ?? [])
      .map((link) => ({
        href: absoluteUrl(link.href, pageUrl),
        text: normalizeText(link.text),
      }))
      .filter((link) => Boolean(link.href));
    const linkUrls = unique(links.map((link) => link.href));
    const emails = unique(text.match(EMAIL_PATTERN) ?? []);
    const phones = unique(text.match(PHONE_PATTERN) ?? []);
    const forms = unique([
      ...(text.match(FORM_PATTERN) ?? []),
      ...linkUrls.filter((link) => FORM_URL_PATTERN.test(link)),
    ]);
    const explicitTitle = findExplicitTitle(snapshot.rawText ?? text);
    const structuredTitles = unique(snapshot.titleTexts ?? [])
      .map((value) => clip(value, 180))
      .filter(Boolean);
    const statusOrJobUrl = linkUrls.find((link) => JOB_URL_PATTERN.test(link));
    const applyLink = chooseLink(links, APPLY_TEXT_PATTERN);
    const hasApplicationEvidence = Boolean(applyLink || forms.length > 0);

    if (
      !hasPositiveJobSignal(text) &&
      !explicitTitle &&
      structuredTitles.length === 0 &&
      !statusOrJobUrl &&
      !hasApplicationEvidence
    ) {
      return null;
    }

    const selectorTitle = structuredTitles[0] ?? null;
    const headingTitle = unique(snapshot.headingTexts ?? [])
      .map((value) => clip(value, 180))
      .find((value) => value && hasPositiveJobSignal(value));
    const title = selectorTitle ?? explicitTitle ?? headingTitle ?? null;
    const company =
      unique(snapshot.companyTexts ?? [])
        .map((value) => clip(value, 180))
        .find(Boolean) ?? null;
    const location =
      unique(snapshot.locationTexts ?? [])
        .map((value) => clip(value, 180))
        .find(Boolean) ?? null;

    const sourceUrl = statusOrJobUrl ?? pageUrl;
    const applyUrl = applyLink ?? forms[0] ?? null;

    return {
      sourceUrl,
      sourcePlatform: detectSourcePlatform(sourceUrl),
      title,
      company,
      location,
      description: clip(text, 1500),
      applyUrl,
      emails,
      phones,
      forms,
      evidence: text ? [clip(text, 420)].filter(Boolean) : [],
      detectedAt: new Date().toISOString(),
    };
  }

  function textValues(element, selectors) {
    return unique(
      selectors.flatMap((selector) =>
        Array.from(element.querySelectorAll(selector)).map(
          (node) => node.textContent,
        ),
      ),
    );
  }

  function candidateSnapshot(element) {
    return {
      text: element.textContent,
      rawText: element.innerText,
      titleTexts: textValues(element, [
        '[data-testid*="job-title"]',
        '[class*="job-title"]',
        '[class*="jobTitle"]',
        '.jobs-unified-top-card__job-title',
        'h1',
      ]),
      headingTexts: textValues(element, ['h2', 'h3']),
      companyTexts: textValues(element, [
        '[data-testid*="company"]',
        '[class*="company"]',
        '[class*="employer"]',
        '.jobs-unified-top-card__company-name',
      ]),
      locationTexts: textValues(element, [
        '[data-testid*="location"]',
        '[class*="location"]',
        '[class*="locality"]',
        '.jobs-unified-top-card__bullet',
      ]),
      links: Array.from(element.querySelectorAll('a[href]')).map((anchor) => ({
        href: anchor.getAttribute('href'),
        text: anchor.textContent,
      })),
    };
  }

  function collectCandidateElements(documentObject) {
    const candidates = new Set();
    const selectors = [
      'article[data-testid="tweet"]',
      '[data-occludable-job-id]',
      '.jobs-search-results__list-item',
      '.job-card-container',
      '.jobs-unified-top-card',
      '[data-job-id]',
      '[data-testid*="job-card"]',
      '[class*="job-card"]',
      '[class*="jobCard"]',
      '[class*="job-listing"]',
      '[class*="vacancy"]',
    ];

    for (const selector of selectors) {
      for (const element of documentObject.querySelectorAll(selector)) {
        candidates.add(element);
        if (candidates.size >= 200) return Array.from(candidates);
      }
    }

    if (candidates.size < 200) {
      for (const element of documentObject.querySelectorAll('article, main li')) {
        const text = normalizeText(element.textContent);
        if (
          text.length >= 40 &&
          text.length <= 12_000 &&
          hasPositiveJobSignal(text)
        ) {
          candidates.add(element);
        }
        if (candidates.size >= 200) break;
      }
    }

    if (candidates.size === 0) {
      const main = documentObject.querySelector('main');
      const text = normalizeText(main?.textContent);
      if (main && text.length >= 40 && hasPositiveJobSignal(text)) {
        candidates.add(main);
      }
    }

    return Array.from(candidates);
  }

  function extractJobRecords(documentObject, pageUrl) {
    return collectCandidateElements(documentObject)
      .map((element) =>
        parseCandidateSnapshot(candidateSnapshot(element), pageUrl),
      )
      .filter(Boolean)
      .slice(0, 150);
  }

  function detectLoginRequired(documentObject, pageUrl, recordCount) {
    const text = normalizeText(documentObject.body?.textContent).slice(0, 6000);
    let hostname = '';
    let pathname = '';
    try {
      const url = new URL(pageUrl);
      hostname = url.hostname.toLowerCase();
      pathname = url.pathname.toLowerCase();
    } catch {
      return false;
    }

    if (recordCount > 0) return false;
    if (/\/(?:login|signin|checkpoint|auth)/i.test(pathname)) return true;

    if (hostname.includes('linkedin.com')) {
      return /(?:sign in|تسجيل الدخول|انضم إلى لينكدإن)/iu.test(text);
    }
    if (hostname === 'x.com' || hostname.includes('twitter.com')) {
      return /(?:sign in to x|تسجيل الدخول إلى x|log in to x)/iu.test(text);
    }

    return false;
  }

  async function sleep(milliseconds) {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  async function runScan(config) {
    const requestId = String(config.requestId);
    const rounds = Math.max(1, Math.min(12, Number(config.rounds) || 7));
    cancelledRequests.delete(requestId);
    let roundsCompleted = 0;
    let stableRounds = 0;
    let previousHeight = document.documentElement.scrollHeight;
    const startedAt = Date.now();

    for (let round = 1; round <= rounds; round += 1) {
      if (cancelledRequests.has(requestId)) {
        return {
          cancelled: true,
          jobs: [],
          loginRequired: false,
          roundsCompleted,
          partial: true,
        };
      }

      window.scrollBy({
        top: Math.max(window.innerHeight * 0.85, 640),
        left: 0,
        behavior: 'smooth',
      });
      await sleep(650);
      roundsCompleted = round;

      try {
        await chrome.runtime.sendMessage({
          internalType: 'QADDEM_SCANNER_PROGRESS',
          requestId,
          currentRound: round,
          totalRounds: rounds,
        });
      } catch {
        // Progress is optional; scanning continues if the service worker restarted.
      }

      const nextHeight = document.documentElement.scrollHeight;
      stableRounds = nextHeight <= previousHeight ? stableRounds + 1 : 0;
      previousHeight = nextHeight;
      if (stableRounds >= 2 || Date.now() - startedAt > 20_000) break;
    }

    const jobs = extractJobRecords(document, window.location.href);
    return {
      cancelled: false,
      jobs,
      loginRequired: detectLoginRequired(
        document,
        window.location.href,
        jobs.length,
      ),
      roundsCompleted,
      partial: roundsCompleted < rounds,
    };
  }

  function installRuntimeListener() {
    if (typeof chrome === 'undefined' || !chrome.runtime?.onMessage) return;
    if (globalThis.__QADDEM_SCANNER_LISTENER_INSTALLED__) return;
    globalThis.__QADDEM_SCANNER_LISTENER_INSTALLED__ = true;

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.internalType === 'QADDEM_SCANNER_CANCEL') {
        cancelledRequests.add(String(message.requestId));
        sendResponse({ cancelled: true });
        return false;
      }

      if (message?.internalType !== 'QADDEM_SCANNER_RUN') return false;
      runScan(message)
        .then(sendResponse)
        .catch(() =>
          sendResponse({
            cancelled: false,
            jobs: [],
            loginRequired: false,
            roundsCompleted: 0,
            partial: true,
            error: 'تعذر فحص الصفحة المفتوحة.',
          }),
        );
      return true;
    });
  }

  return {
    detectSourcePlatform,
    extractJobRecords,
    findExplicitTitle,
    installRuntimeListener,
    normalizeText,
    parseCandidateSnapshot,
  };
});
