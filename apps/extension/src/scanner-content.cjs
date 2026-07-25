(function initializeScanner(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.__QADDEM_SCANNER_INTERNALS__ = api;
  api.installRuntimeListener();
})(globalThis, function createScanner() {
  const JOB_SIGNAL_PATTERN =
    /(?:وظيف|شاغر|توظيف|مطلوب|فرصة\s+(?:عمل|وظيفية)|career|vacanc|hiring|job|apply|open\s+positions?|join\s+(?:our|the)\s+team)/iu;
  const STRONG_JOB_SIGNAL_PATTERN =
    /(?:المسمى\s+الوظيفي|المسميات\s+الوظيفية|وظائف\s+شاغرة|فرصة\s+وظيفية|للتقديم|طريقة\s+التقديم|مطلوب\s+(?:موظف|موظفة|للتوظيف)|job\s+title|open\s+positions?|vacanc(?:y|ies)|now\s+hiring|apply\s+(?:now|via)|join\s+our\s+team)/iu;
  const NEGATED_JOB_PATTERN =
    /(?:لا\s+(?:يتعلق|يخص|يوجد|توجد)[^.!؟]{0,45}(?:وظيف|توظيف|تقديم)|not\s+(?:a\s+)?(?:job|hiring|vacancy)|no\s+(?:jobs?|vacancies))/iu;
  const APPLY_TEXT_PATTERN =
    /(?:تقديم|قدّم|قدم الآن|التقديم|apply|easy apply|submit application|register|view job|تفاصيل الوظيفة)/iu;
  const JOB_URL_PATTERN =
    /(?:\/jobs?(?:\/|\?|$)|\/careers?(?:\/|\?|$)|\/vacanc(?:y|ies)(?:\/|\?|$)|\/positions?(?:\/|\?|$)|greenhouse\.io|lever\.co|workdayjobs\.com|myworkdayjobs\.com|successfactors\.com|oraclecloud\.com|indeed\.com\/viewjob|linkedin\.com\/jobs\/view)/i;
  const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const PHONE_PATTERN =
    /(?:\+?9665|05|\+?967|\+?971|\+?965|\+?968|\+?973)[0-9\s-]{7,12}/g;
  const FORM_PATTERN_GLOBAL =
    /https?:\/\/(?:docs\.google\.com\/forms|forms\.gle|(?:www\.)?typeform\.com)\/[^\s<>"')\]]+/gi;
  const FORM_PATTERN_SINGLE =
    /^https?:\/\/(?:docs\.google\.com\/forms|forms\.gle|(?:www\.)?typeform\.com)\//i;
  const IMAGE_HINT_PATTERN =
    /(?:وظيف|توظيف|شاغر|مطلوب|إعلان|اعلان|job|career|vacan|hiring|recruit)/iu;
  const GENERIC_TITLE_PATTERN =
    /^(?:the\s+following\s+positions?(?:\s+to\s+join.*)?|following\s+positions?|open\s+positions?|available\s+positions?|positions?|job\s+openings?|vacancies|jobs?|المسميات\s+الوظيفية|الوظائف\s+الشاغرة|الوظائف\s+التالية|الوظائف|المسمى(?:\s+الوظيفي)?|بمسمى|مطلوب|فرصة\s+وظيفية)\s*:?\s*$/iu;
  const STOP_SECTION_PATTERN =
    /^(?:المتطلبات|الشروط|المؤهلات|المهام|المزايا|التفاصيل|الموقع|المدينة|مكان\s+العمل|للتقديم|طريقة\s+التقديم|التقديم|requirements?|qualifications?|responsibilities|benefits?|location|apply|how\s+to\s+apply|working\s+hours?|salary)\b/iu;
  const ROLE_WORD_PATTERN =
    /(?:مهندس|مهندسة|محاسب|محاسبة|مطور|مطورة|مبرمج|مبرمجة|مصمم|مصممة|مدير|مديرة|أخصائي|أخصائية|منسق|منسقة|مسؤول|مسؤولة|مندوب|مندوبة|موظف|موظفة|فني|فنية|ممرض|ممرضة|طبيب|طبيبة|صيدلي|صيدلانية|معلم|معلمة|مدرب|مدربة|مشرف|مشرفة|مراقب|مراقبة|سائق|حارس|كاتب|سكرتير|سكرتيرة|باحث|باحثة|محلل|محللة|استشاري|استشارية|مساعد|مساعدة|operator|engineer|accountant|developer|programmer|designer|manager|specialist|coordinator|officer|representative|technician|nurse|doctor|pharmacist|teacher|trainer|supervisor|analyst|consultant|assistant|receptionist|sales|marketing|hr|human\s+resources|customer\s+service|call\s+center|data\s+entry|project\s+manager|office\s+engineer)/iu;
  const LOCATION_NAMES = [
    'الرياض', 'جدة', 'مكة', 'مكة المكرمة', 'المدينة', 'المدينة المنورة', 'الدمام',
    'الخبر', 'الظهران', 'الجبيل', 'ينبع', 'الطائف', 'تبوك', 'أبها', 'خميس مشيط',
    'جازان', 'نجران', 'حائل', 'بريدة', 'عنيزة', 'القصيم', 'الأحساء', 'الهفوف',
    'القطيف', 'عرعر', 'سكاكا', 'الباحة', 'Riyadh', 'Jeddah', 'Makkah', 'Mecca',
    'Madinah', 'Medina', 'Dammam', 'Khobar', 'Dhahran', 'Jubail', 'Yanbu', 'Taif',
    'Tabuk', 'Abha', 'Khamis Mushait', 'Jazan', 'Najran', 'Hail', 'Buraidah',
    'Qassim', 'Al Ahsa', 'Remote', 'عن بعد',
  ];
  const cancelledRequests = new Set();

  const SOURCE_ADAPTERS = {
    google: {
      cardSelectors: [
        '[data-entityid*="job"]',
        '[data-job-id]',
        '[role="listitem"]',
        'div.MjjYud',
        'div.g',
      ],
      titleSelectors: ['[role="heading"]', 'h2', 'h3', '[data-testid*="title"]'],
      companySelectors: ['[class*="company"]', '[data-testid*="company"]', '.vNEEBe'],
      locationSelectors: ['[class*="location"]', '[data-testid*="location"]', '.Qk80Jf'],
    },
    linkedin: {
      cardSelectors: [
        '[data-occludable-job-id]',
        '.jobs-search-results__list-item',
        '.job-card-container',
        '.jobs-unified-top-card',
        '[data-job-id]',
      ],
      titleSelectors: [
        '.job-card-list__title',
        '.job-card-container__link',
        '.jobs-unified-top-card__job-title',
        '[class*="job-title"]',
        'h1',
      ],
      companySelectors: [
        '.job-card-container__primary-description',
        '.jobs-unified-top-card__company-name',
        '[class*="company"]',
      ],
      locationSelectors: [
        '.job-card-container__metadata-item',
        '.jobs-unified-top-card__bullet',
        '[class*="location"]',
      ],
    },
    indeed: {
      cardSelectors: [
        '[data-jk]',
        '.job_seen_beacon',
        '.jobsearch-ResultsList > li',
        '.jobsearch-JobComponent',
        '[class*="jobCard"]',
      ],
      titleSelectors: ['h2.jobTitle', '[data-testid="jobsearch-JobInfoHeader-title"]', 'h2', 'h1'],
      companySelectors: ['[data-testid="company-name"]', '.companyName', '[class*="company"]'],
      locationSelectors: ['[data-testid="text-location"]', '.companyLocation', '[class*="location"]'],
    },
    bayt: {
      cardSelectors: [
        '[data-js-aid="jobID"]',
        '[data-job-id]',
        '[class*="job-card"]',
        '[class*="jobCard"]',
        'li[class*="job"]',
        'article',
      ],
      titleSelectors: ['[class*="job-title"]', '[class*="title"] h2', 'h2', 'h1'],
      companySelectors: ['[class*="company"]', '[class*="employer"]'],
      locationSelectors: ['[class*="location"]', '[class*="city"]'],
    },
    jadarat: {
      cardSelectors: [
        '[data-testid*="job"]',
        '[data-job-id]',
        '[class*="job-card"]',
        '[class*="jobCard"]',
        '[class*="vacancy"]',
        'article',
      ],
      titleSelectors: ['[data-testid*="title"]', '[class*="job-title"]', 'h2', 'h3', 'h1'],
      companySelectors: ['[data-testid*="company"]', '[class*="company"]', '[class*="employer"]'],
      locationSelectors: ['[data-testid*="location"]', '[class*="location"]', '[class*="city"]'],
    },
    ats: {
      cardSelectors: [
        '.opening',
        '.posting',
        '[data-automation-id="jobTitle"]',
        '[data-automation-id="jobPostingHeader"]',
        '[data-job-id]',
        '[class*="job-card"]',
        '[class*="jobCard"]',
        '[class*="job-listing"]',
        '[class*="vacancy"]',
      ],
      titleSelectors: [
        '[data-automation-id="jobTitle"]',
        '.posting-title h5',
        '.opening a',
        '[class*="job-title"]',
        'h1',
        'h2',
      ],
      companySelectors: ['[data-automation-id="company"]', '[class*="company"]', '[class*="employer"]'],
      locationSelectors: ['[data-automation-id="locations"]', '[class*="location"]', '[class*="city"]'],
    },
    company: {
      cardSelectors: [
        '[data-job-id]',
        '[data-testid*="job-card"]',
        '[class*="job-card"]',
        '[class*="jobCard"]',
        '[class*="job-listing"]',
        '[class*="vacancy"]',
        'article',
        'main li',
      ],
      titleSelectors: ['[data-testid*="job-title"]', '[class*="job-title"]', '[class*="jobTitle"]', 'h1', 'h2', 'h3'],
      companySelectors: ['[data-testid*="company"]', '[class*="company"]', '[class*="employer"]'],
      locationSelectors: ['[data-testid*="location"]', '[class*="location"]', '[class*="locality"]', '[class*="city"]'],
    },
  };

  function normalizeText(value) {
    return String(value ?? '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalizeMultiline(value) {
    return String(value ?? '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\r/g, '')
      .split('\n')
      .map((line) => line.replace(/[ \t]+/g, ' ').trim())
      .filter(Boolean)
      .join('\n')
      .trim();
  }

  function clip(value, maxLength) {
    const normalized = normalizeText(value);
    if (!normalized) return null;
    return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}…` : normalized;
  }

  function clipMultiline(value, maxLength) {
    const normalized = normalizeMultiline(value);
    if (!normalized) return null;
    return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}…` : normalized;
  }

  function unique(values) {
    return Array.from(new Set((values ?? []).map((value) => normalizeText(value)).filter(Boolean)));
  }

  function absoluteUrl(value, baseUrl) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const parsed = new URL(value, baseUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) return null;
      parsed.hash = '';
      return parsed.toString();
    } catch {
      return null;
    }
  }

  function unwrapSearchRedirect(value, baseUrl) {
    const absolute = absoluteUrl(value, baseUrl);
    if (!absolute) return null;
    try {
      const url = new URL(absolute);
      if (/google\./i.test(url.hostname) && url.pathname === '/url') {
        const target = url.searchParams.get('q') || url.searchParams.get('url');
        return absoluteUrl(target, baseUrl) ?? absolute;
      }
      return absolute;
    } catch {
      return absolute;
    }
  }

  function detectSourcePlatform(input) {
    try {
      const hostname = new URL(input).hostname.toLowerCase();
      if (hostname === 'x.com' || hostname.endsWith('.x.com') || hostname.includes('twitter.com')) return 'x';
      if (hostname.includes('google.')) return 'google';
      if (hostname.includes('linkedin.com')) return 'linkedin';
      if (hostname.includes('indeed.')) return 'indeed';
      if (hostname.includes('bayt.com')) return 'bayt';
      if (hostname.includes('jadarat.sa') || hostname.includes('jadarat')) return 'jadarat';
      if (
        hostname.includes('greenhouse.io') ||
        hostname.includes('lever.co') ||
        hostname.includes('workdayjobs.com') ||
        hostname.includes('myworkdayjobs.com') ||
        hostname.includes('successfactors.com') ||
        hostname.includes('oraclecloud.com') ||
        hostname.includes('smartrecruiters.com') ||
        hostname.includes('recruitee.com')
      ) return 'ats';
      return 'company';
    } catch {
      return 'unknown';
    }
  }

  function sourceAdapterForUrl(pageUrl) {
    const platform = detectSourcePlatform(pageUrl);
    if (platform === 'x') return { id: 'x', platform };
    return { id: SOURCE_ADAPTERS[platform] ? platform : 'company', platform };
  }

  function cleanTitleCandidate(value) {
    const cleaned = normalizeText(value)
      .replace(/^[\s\-–—•●▪◦·*✓✔✅☑️🔹🔸➡️👉\d.)،,:：]+/u, '')
      .replace(/[\s\-–—•|،,:：]+$/u, '')
      .replace(/^["'“”‘’([{]+|["'“”‘’)\]}]+$/gu, '')
      .trim();
    if (!cleaned || cleaned.length < 2 || cleaned.length > 160) return null;
    if (GENERIC_TITLE_PATTERN.test(cleaned) || STOP_SECTION_PATTERN.test(cleaned)) return null;
    if (/^(?:https?:\/\/|www\.|@|#)/i.test(cleaned)) return null;
    EMAIL_PATTERN.lastIndex = 0;
    if (EMAIL_PATTERN.test(cleaned)) {
      EMAIL_PATTERN.lastIndex = 0;
      return null;
    }
    EMAIL_PATTERN.lastIndex = 0;
    if (/\b(?:سنوات?|years?|ساعات?|hours?|راتب|salary|دوام|shift)\b/iu.test(cleaned)) return null;
    return cleaned;
  }

  function looksLikeRoleTitle(value, allowUnmarked = false) {
    const cleaned = cleanTitleCandidate(value);
    if (!cleaned) return false;
    if (ROLE_WORD_PATTERN.test(cleaned)) return true;
    if (!allowUnmarked) return false;
    const words = cleaned.split(/\s+/).length;
    return words >= 1 && words <= 10 && !/[.!؟]$/.test(cleaned);
  }

  function splitInlineTitles(value) {
    return unique(
      normalizeText(value)
        .split(/\s*(?:[|•؛;]|\s+-\s+|\s+\/\s+)\s*/u)
        .map(cleanTitleCandidate)
        .filter(Boolean),
    );
  }

  function extractTitleCandidates(rawText) {
    const multiline = normalizeMultiline(rawText);
    const lines = multiline.split('\n').map((line) => line.trim()).filter(Boolean);
    const titles = [];
    let collectFollowing = false;
    let collected = 0;

    for (const original of lines) {
      const line = original.replace(/^[\s>*]+/u, '').trim();
      const marker = line.match(
        /^(?:المسمى(?:\s+الوظيفي)?|الوظيفة|الشاغر(?:\s+الوظيفي)?|بمسمى|مطلوب(?:\s+للتوظيف)?|job\s+title|position(?:\s+of)?|hiring\s+for|vacancy)\s*[:：\-–—]\s*(.*)$/iu,
      );
      if (marker) {
        const inline = splitInlineTitles(marker[1]);
        inline.forEach((candidate) => { if (looksLikeRoleTitle(candidate, true)) titles.push(candidate); });
        collectFollowing = inline.length === 0;
        collected = 0;
        continue;
      }
      const heading = line.match(
        /^(?:المسميات\s+الوظيفية|الوظائف\s+الشاغرة|الوظائف\s+التالية|الوظائف\s+المتاحة|the\s+following\s+positions?(?:\s+to\s+join.*)?|open\s+positions?|available\s+positions?|job\s+openings?|vacancies)\s*:?\s*(.*)$/iu,
      );
      if (heading) {
        splitInlineTitles(heading[1]).forEach((candidate) => {
          if (looksLikeRoleTitle(candidate, true)) titles.push(candidate);
        });
        collectFollowing = true;
        collected = 0;
        continue;
      }
      if (collectFollowing) {
        if (STOP_SECTION_PATTERN.test(line)) {
          collectFollowing = false;
          continue;
        }
        const candidate = cleanTitleCandidate(line);
        if (candidate && looksLikeRoleTitle(candidate, true)) {
          titles.push(candidate);
          collected += 1;
          if (collected >= 16) collectFollowing = false;
          continue;
        }
        if (collected > 0 && line.length > 160) collectFollowing = false;
      }
      const bullet = line.match(/^(?:[-–—•●▪◦·*✓✔✅☑️🔹🔸➡️👉]|\d{1,2}[.)-])\s*(.+)$/u);
      if (bullet) {
        const candidate = cleanTitleCandidate(bullet[1]);
        if (candidate && looksLikeRoleTitle(candidate, false)) titles.push(candidate);
      }
    }

    for (const pattern of [
      /(?:المسمى\s+الوظيفي|الوظيفة|بمسمى|شاغر(?:\s+وظيفي)?|مطلوب(?:\s+للتوظيف)?)[\s:：\-–—]+([^\n|•]{2,160})/giu,
      /(?:job\s+title|position(?:\s+of)?|hiring\s+for|vacancy)[\s:：\-–—]+([^\n|•]{2,160})/giu,
    ]) {
      for (const match of multiline.matchAll(pattern)) {
        const candidate = cleanTitleCandidate(match[1]);
        if (candidate && looksLikeRoleTitle(candidate, true)) titles.push(candidate);
      }
    }
    return unique(titles).slice(0, 24);
  }

  function findExplicitTitle(text) {
    return extractTitleCandidates(text)[0] ?? null;
  }

  function extractLocations(text) {
    const multiline = normalizeMultiline(text);
    const normalized = normalizeText(multiline);
    const found = [];
    const explicit = multiline.match(
      /(?:^|\n)(?:الموقع|المدينة|مكان\s+العمل|location|city)\s*[:：\-–—]\s*([^\n|•،,.;]{2,100})/iu,
    );
    if (explicit?.[1]) found.push(normalizeText(explicit[1]));
    for (const name of LOCATION_NAMES) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`(?:^|[^\\p{L}])${escaped}(?:$|[^\\p{L}])`, 'iu').test(normalized)) found.push(name);
    }
    return unique(found).slice(0, 5);
  }

  function extractCompany(text) {
    const multiline = normalizeMultiline(text);
    for (const pattern of [
      /(?:تعلن|أعلنت)\s+((?:شركة|مجموعة|مؤسسة|مستشفى|جامعة|أكاديمية|مصنع|مركز)\s+.{2,90}?)\s+(?:عن|توفر|فتح|حاجتها)/iu,
      /((?:شركة|مجموعة|مؤسسة|مستشفى|جامعة|أكاديمية|مصنع|مركز)\s+.{2,90}?)\s+(?:تعلن|تبحث|توفر|ترغب)/iu,
      /([A-Z][A-Za-z0-9&.' -]{2,80})\s+(?:is\s+hiring|is\s+seeking|announces|has\s+an?\s+opening)/i,
    ]) {
      const value = clip(multiline.match(pattern)?.[1], 140);
      if (value && !GENERIC_TITLE_PATTERN.test(value)) return value;
    }
    return null;
  }

  function cleanEmailMatches(text) {
    EMAIL_PATTERN.lastIndex = 0;
    const matches = text.match(EMAIL_PATTERN) ?? [];
    EMAIL_PATTERN.lastIndex = 0;
    return unique(matches.map((value) => value.replace(/[.,;:،؛]+$/u, '')));
  }

  function cleanPhoneMatches(text) {
    PHONE_PATTERN.lastIndex = 0;
    const matches = text.match(PHONE_PATTERN) ?? [];
    PHONE_PATTERN.lastIndex = 0;
    return unique(matches.map((value) => value.replace(/\s+/g, ' ').trim()));
  }

  function meaningfulImageUrl(image, pageUrl) {
    const url = absoluteUrl(image?.src, pageUrl);
    if (!url) return null;
    const width = Number(image?.width ?? 0);
    const height = Number(image?.height ?? 0);
    const alt = normalizeText(image?.alt);
    const signature = `${url} ${alt}`.toLowerCase();
    const isXMedia = /pbs\.twimg\.com\/media\//i.test(url);
    const decorative = /(?:profile_images|emoji|avatar|favicon|sprite|icon|logo)/i.test(signature) && !IMAGE_HINT_PATTERN.test(alt);
    if (decorative && !isXMedia) return null;
    if (!isXMedia && width < 180 && height < 100 && !IMAGE_HINT_PATTERN.test(alt)) return null;
    return url;
  }

  function textValues(element, selectors) {
    return unique(selectors.flatMap((selector) =>
      Array.from(element.querySelectorAll(selector)).map((node) => node.textContent),
    ));
  }

  function linkSnapshot(anchor, baseUrl) {
    const href = unwrapSearchRedirect(anchor.getAttribute('href'), baseUrl);
    const expanded = unwrapSearchRedirect(
      anchor.getAttribute('data-expanded-url') || anchor.getAttribute('data-url') || anchor.getAttribute('title') || anchor.dataset?.expandedUrl,
      baseUrl,
    );
    return { href, expandedUrl: expanded, text: anchor.textContent };
  }

  function sourceItemIdForElement(element, pageUrl) {
    for (const name of ['data-jk', 'data-job-id', 'data-occludable-job-id', 'data-entityid', 'data-id']) {
      const value = element.getAttribute?.(name);
      if (value) return String(value);
    }
    const href = Array.from(element.querySelectorAll?.('a[href]') ?? [])
      .map((anchor) => unwrapSearchRedirect(anchor.getAttribute('href'), pageUrl))
      .find((value) => value && JOB_URL_PATTERN.test(value));
    return href ?? null;
  }

  function candidateSnapshot(element, pageUrl, adapter) {
    const config = SOURCE_ADAPTERS[adapter.id] ?? SOURCE_ADAPTERS.company;
    const companyTexts = textValues(element, config.companySelectors);
    return {
      text: element.textContent,
      rawText: element.innerText,
      titleTexts: textValues(element, config.titleSelectors),
      headingTexts: textValues(element, ['h1', 'h2', 'h3', '[role="heading"]']),
      companyTexts,
      locationTexts: textValues(element, config.locationSelectors),
      links: Array.from(element.querySelectorAll('a[href]')).map((anchor) => linkSnapshot(anchor, pageUrl)),
      images: Array.from(element.querySelectorAll('img[src]')).map((image) => ({
        src: image.currentSrc || image.getAttribute('src'),
        alt: image.getAttribute('alt'),
        width: image.naturalWidth || image.width || 0,
        height: image.naturalHeight || image.height || 0,
      })),
      authorName: companyTexts[0] ?? null,
      authorHandle: null,
      publishedAt: element.querySelector('time')?.getAttribute('datetime') || null,
      sourceItemId: sourceItemIdForElement(element, pageUrl),
    };
  }

  function chooseLink(links, predicate) {
    for (const link of links) {
      for (const candidate of [link.expandedUrl, link.href]) {
        if (candidate && predicate(`${link.text ?? ''} ${candidate}`)) return candidate;
      }
    }
    return null;
  }

  function reviewStatusForRecord({ title, hasStrongSignal, hasJobSignal, hasContact, hasJobLink, imageUrls }) {
    if (title && (hasStrongSignal || hasContact || hasJobLink)) return 'confirmed';
    if (title || hasJobSignal || hasContact || hasJobLink) return 'potential';
    if (imageUrls.length > 0) return 'needs_ocr';
    return 'incomplete';
  }

  function confidenceForRecord({ title, company, location, hasStrongSignal, hasContact, hasJobLink, imageUrls }) {
    let score = 0.16;
    if (title) score += 0.34;
    if (company) score += 0.1;
    if (location) score += 0.08;
    if (hasStrongSignal) score += 0.12;
    if (hasContact) score += 0.08;
    if (hasJobLink) score += 0.1;
    if (imageUrls.length > 0 && !title) score += 0.02;
    return Math.max(0, Math.min(1, Number(score.toFixed(2))));
  }

  function parseCandidateSnapshot(snapshot, pageUrl) {
    const rawText = normalizeMultiline(snapshot.rawText ?? snapshot.text);
    const text = normalizeText(snapshot.text ?? rawText);
    const links = (snapshot.links ?? []).map((link) => ({
      href: unwrapSearchRedirect(link.href, pageUrl),
      expandedUrl: unwrapSearchRedirect(link.expandedUrl, pageUrl),
      text: normalizeText(link.text),
    })).filter((link) => link.href || link.expandedUrl);
    const linkUrls = unique(links.flatMap((link) => [link.expandedUrl, link.href]).filter(Boolean));
    const emails = cleanEmailMatches(text);
    const phones = cleanPhoneMatches(text);
    const forms = unique([...(text.match(FORM_PATTERN_GLOBAL) ?? []), ...linkUrls.filter((link) => FORM_PATTERN_SINGLE.test(link))]);
    const imageUrls = unique((snapshot.images ?? []).map((image) => meaningfulImageUrl(image, pageUrl)).filter(Boolean)).slice(0, 4);
    const hasJobSignal = JOB_SIGNAL_PATTERN.test(text) && !NEGATED_JOB_PATTERN.test(text);
    const hasStrongSignal = STRONG_JOB_SIGNAL_PATTERN.test(text);
    const hasContact = emails.length > 0 || phones.length > 0 || forms.length > 0;
    const jobLinks = linkUrls.filter((url) => JOB_URL_PATTERN.test(url));
    const hasJobLink = jobLinks.length > 0;
    if (!hasJobSignal && !hasContact && !hasJobLink && imageUrls.length === 0) return null;

    const selectorTitle = unique(snapshot.titleTexts ?? []).map(cleanTitleCandidate).find((value) => value && looksLikeRoleTitle(value, true));
    const headingTitle = unique(snapshot.headingTexts ?? []).map(cleanTitleCandidate).find((value) => value && looksLikeRoleTitle(value, false));
    const title = selectorTitle ?? findExplicitTitle(rawText) ?? headingTitle ?? null;
    const company = unique(snapshot.companyTexts ?? []).map((value) => clip(value, 180)).find(Boolean) ?? extractCompany(rawText);
    const locations = unique([...(snapshot.locationTexts ?? []), ...extractLocations(rawText)]).map((value) => clip(value, 100)).filter(Boolean);
    const location = locations.length ? locations.join('، ') : null;
    const applyUrl = chooseLink(links, (value) => APPLY_TEXT_PATTERN.test(value)) ?? forms[0] ?? jobLinks[0] ?? null;
    const sourceUrl = jobLinks[0] ?? applyUrl ?? pageUrl;
    const reviewStatus = reviewStatusForRecord({ title, hasStrongSignal, hasJobSignal, hasContact, hasJobLink, imageUrls });
    const confidence = confidenceForRecord({ title, company, location, hasStrongSignal, hasContact, hasJobLink, imageUrls });

    return {
      sourceUrl,
      sourcePlatform: detectSourcePlatform(sourceUrl),
      title,
      company,
      location,
      description: clipMultiline(rawText, 2400),
      applyUrl,
      emails,
      phones,
      forms,
      imageUrls,
      ocrStatus: imageUrls.length ? 'not_requested' : 'not_applicable',
      ocrText: null,
      evidence: rawText ? [clip(rawText, 500)].filter(Boolean) : [],
      detectedAt: new Date().toISOString(),
      reviewStatus,
      confidence,
      rawText: clipMultiline(rawText, 6000),
      authorName: snapshot.authorName ?? company ?? null,
      authorHandle: snapshot.authorHandle ?? null,
      publishedAt: snapshot.publishedAt ?? null,
      sourceItemId: snapshot.sourceItemId ?? sourceUrl,
    };
  }

  function tweetPermalink(article, pageUrl) {
    const timeLink = article.querySelector('time')?.closest('a[href]');
    return [timeLink?.getAttribute('href'), ...Array.from(article.querySelectorAll('a[href*="/status/"]')).map((a) => a.getAttribute('href'))]
      .map((value) => absoluteUrl(value, pageUrl))
      .find((value) => /\/status\/\d+/i.test(value ?? '')) ?? null;
  }

  function xTweetSnapshot(article, pageUrl) {
    const tweetText = article.querySelector('[data-testid="tweetText"]');
    const rawText = normalizeMultiline(tweetText?.innerText || tweetText?.textContent);
    const sourceUrl = tweetPermalink(article, pageUrl) ?? pageUrl;
    const nameLines = normalizeMultiline(article.querySelector('[data-testid="User-Name"]')?.innerText).split('\n');
    const authorHandle = nameLines.find((line) => /^@[A-Za-z0-9_]{1,30}$/.test(line)) ?? null;
    const authorName = nameLines.find((line) => line && line !== authorHandle && !/^·$/.test(line)) ?? null;
    return {
      text: rawText,
      rawText,
      titleTexts: [], headingTexts: [], companyTexts: [], locationTexts: [],
      links: Array.from(article.querySelectorAll('[data-testid="tweetText"] a[href], [data-testid="card.wrapper"] a[href], a[href*="t.co"]')).map((anchor) => linkSnapshot(anchor, pageUrl)),
      images: Array.from(article.querySelectorAll('[data-testid="tweetPhoto"] img[src], img[src*="pbs.twimg.com/media"]')).map((image) => ({
        src: image.currentSrc || image.getAttribute('src'), alt: image.getAttribute('alt'), width: image.naturalWidth || image.width || 0, height: image.naturalHeight || image.height || 0,
      })),
      authorName,
      authorHandle,
      publishedAt: article.querySelector('time')?.getAttribute('datetime') || null,
      sourceItemId: sourceUrl.match(/\/status\/(\d+)/i)?.[1] ?? null,
      sourceUrl,
    };
  }

  function parseXSnapshot(snapshot, pageUrl) {
    const rawText = normalizeMultiline(snapshot.rawText);
    const base = parseCandidateSnapshot({ ...snapshot, rawText, text: rawText }, snapshot.sourceUrl ?? pageUrl);
    if (!base) return [];
    const titles = extractTitleCandidates(rawText);
    const resultTitles = titles.length ? titles : [base.title];
    return resultTitles.map((title) => ({
      ...base,
      sourceUrl: snapshot.sourceUrl ?? base.sourceUrl,
      sourcePlatform: 'x',
      title,
      sourceItemId: snapshot.sourceItemId ?? base.sourceItemId,
      reviewStatus: reviewStatusForRecord({
        title,
        hasStrongSignal: STRONG_JOB_SIGNAL_PATTERN.test(rawText),
        hasJobSignal: JOB_SIGNAL_PATTERN.test(rawText),
        hasContact: base.emails.length > 0 || base.phones.length > 0 || base.forms.length > 0,
        hasJobLink: Boolean(base.applyUrl),
        imageUrls: base.imageUrls,
      }),
    }));
  }

  function collectCandidateElements(documentObject, pageUrl) {
    const adapter = sourceAdapterForUrl(pageUrl);
    const config = SOURCE_ADAPTERS[adapter.id] ?? SOURCE_ADAPTERS.company;
    const candidates = new Set();
    for (const selector of config.cardSelectors) {
      for (const element of documentObject.querySelectorAll(selector)) {
        const text = normalizeText(element.textContent);
        const links = Array.from(element.querySelectorAll('a[href]')).map((a) => unwrapSearchRedirect(a.getAttribute('href'), pageUrl)).filter(Boolean);
        const hasRelevantLink = links.some((url) => JOB_URL_PATTERN.test(url));
        const hasImage = Array.from(element.querySelectorAll('img[src]')).some((image) => (image.naturalWidth || image.width || 0) >= 180 && (image.naturalHeight || image.height || 0) >= 100);
        if ((text.length >= 20 && (JOB_SIGNAL_PATTERN.test(text) || hasRelevantLink)) || hasImage) candidates.add(element);
        if (candidates.size >= 400) return { adapter, elements: Array.from(candidates) };
      }
    }
    if (candidates.size === 0) {
      for (const element of documentObject.querySelectorAll('article, main li')) {
        const text = normalizeText(element.textContent);
        if (text.length >= 30 && text.length <= 14_000 && JOB_SIGNAL_PATTERN.test(text) && !NEGATED_JOB_PATTERN.test(text)) candidates.add(element);
        if (candidates.size >= 400) break;
      }
    }
    return { adapter, elements: Array.from(candidates) };
  }

  function extractXJobRecords(documentObject, pageUrl) {
    return Array.from(documentObject.querySelectorAll('article[data-testid="tweet"]'))
      .flatMap((article) => parseXSnapshot(xTweetSnapshot(article, pageUrl), pageUrl))
      .slice(0, 400);
  }

  function extractJobRecords(documentObject, pageUrl) {
    if (detectSourcePlatform(pageUrl) === 'x') return extractXJobRecords(documentObject, pageUrl);
    const { adapter, elements } = collectCandidateElements(documentObject, pageUrl);
    return elements.map((element) => parseCandidateSnapshot(candidateSnapshot(element, pageUrl, adapter), pageUrl)).filter(Boolean).slice(0, 400);
  }

  function canonicalSourceUrl(value) {
    try {
      const url = new URL(value);
      url.hash = '';
      for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'source']) url.searchParams.delete(key);
      return url.toString().replace(/\/$/, '').toLowerCase();
    } catch {
      return normalizeText(value).toLowerCase();
    }
  }

  function localRecordKey(record) {
    const source = canonicalSourceUrl(record.sourceUrl);
    const title = normalizeText(record.title).toLowerCase() || '__raw__';
    return `${source}|${title}`;
  }

  function mergeRecord(current, incoming) {
    if (!current) return incoming;
    const rank = { confirmed: 4, potential: 3, needs_ocr: 2, incomplete: 1 };
    const imageUrls = unique([...(current.imageUrls ?? []), ...(incoming.imageUrls ?? [])]);
    return {
      ...current,
      title: current.title ?? incoming.title,
      company: current.company ?? incoming.company,
      location: current.location ?? incoming.location,
      description: String(incoming.description ?? '').length > String(current.description ?? '').length ? incoming.description : current.description,
      applyUrl: current.applyUrl ?? incoming.applyUrl,
      emails: unique([...(current.emails ?? []), ...(incoming.emails ?? [])]),
      phones: unique([...(current.phones ?? []), ...(incoming.phones ?? [])]),
      forms: unique([...(current.forms ?? []), ...(incoming.forms ?? [])]),
      imageUrls,
      ocrStatus: current.ocrStatus === 'complete' || incoming.ocrStatus === 'complete' ? 'complete' : imageUrls.length ? 'not_requested' : 'not_applicable',
      ocrText: String(incoming.ocrText ?? '').length > String(current.ocrText ?? '').length ? incoming.ocrText : current.ocrText,
      evidence: unique([...(current.evidence ?? []), ...(incoming.evidence ?? [])]),
      reviewStatus: rank[incoming.reviewStatus] > rank[current.reviewStatus] ? incoming.reviewStatus : current.reviewStatus,
      confidence: Math.max(Number(current.confidence ?? 0), Number(incoming.confidence ?? 0)),
      rawText: String(incoming.rawText ?? '').length > String(current.rawText ?? '').length ? incoming.rawText : current.rawText,
      authorName: current.authorName ?? incoming.authorName,
      authorHandle: current.authorHandle ?? incoming.authorHandle,
      publishedAt: current.publishedAt ?? incoming.publishedAt,
      sourceItemId: current.sourceItemId ?? incoming.sourceItemId,
    };
  }

  function dedupeLocalRecords(records) {
    const map = new Map();
    for (const record of records) {
      const key = localRecordKey(record);
      map.set(key, mergeRecord(map.get(key), record));
    }
    return Array.from(map.values());
  }

  function scanMetrics(records) {
    return {
      confirmedCount: records.filter((r) => r.reviewStatus === 'confirmed').length,
      potentialCount: records.filter((r) => r.reviewStatus === 'potential').length,
      needsOcrCount: records.filter((r) => r.reviewStatus === 'needs_ocr').length,
      incompleteCount: records.filter((r) => r.reviewStatus === 'incomplete').length,
    };
  }

  function detectLoginRequired(documentObject, pageUrl, recordCount) {
    if (recordCount > 0) return false;
    const text = normalizeText(documentObject.body?.textContent).slice(0, 7000);
    let url;
    try { url = new URL(pageUrl); } catch { return false; }
    if (/\/(?:login|signin|checkpoint|auth)/i.test(url.pathname)) return true;
    if (url.hostname.includes('linkedin.com')) return /(?:sign in|تسجيل الدخول|انضم إلى لينكدإن)/iu.test(text);
    if (url.hostname === 'x.com' || url.hostname.includes('twitter.com')) return /(?:sign in to x|تسجيل الدخول إلى x|log in to x)/iu.test(text);
    if (url.hostname.includes('jadarat')) return /(?:تسجيل الدخول|نفاذ|national access)/iu.test(text);
    return false;
  }

  function expandVisibleResults(documentObject, pageUrl) {
    const platform = detectSourcePlatform(pageUrl);
    const controls = Array.from(documentObject.querySelectorAll('button, [role="button"]'));
    for (const control of controls) {
      const label = normalizeText(control.textContent || control.getAttribute('aria-label'));
      const isXExpand = platform === 'x' && /^(?:show\s+more|عرض\s+المزيد)$/iu.test(label);
      const isLoadMore = /^(?:show\s+more\s+jobs?|load\s+more(?:\s+jobs?)?|more\s+jobs?|عرض\s+المزيد\s+من\s+الوظائف|تحميل\s+المزيد|المزيد\s+من\s+الوظائف)$/iu.test(label);
      if (isXExpand || isLoadMore) {
        try { control.click(); } catch { /* best effort */ }
      }
    }
  }

  function shouldResetToTop(pageUrl) {
    try {
      const url = new URL(pageUrl);
      const platform = detectSourcePlatform(pageUrl);
      if (platform === 'x') return !/\/status\/\d+/i.test(url.pathname) && /^\/[A-Za-z0-9_]{1,30}\/?$/.test(url.pathname);
      return platform === 'google' || platform === 'linkedin' || platform === 'indeed' || platform === 'bayt' || platform === 'jadarat';
    } catch {
      return false;
    }
  }

  async function sleep(milliseconds) {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  async function runScan(config) {
    const requestId = String(config.requestId);
    const rounds = Math.max(1, Math.min(24, Number(config.rounds) || 12));
    cancelledRequests.delete(requestId);
    let roundsCompleted = 0;
    let stableRounds = 0;
    let previousHeight = document.documentElement.scrollHeight;
    const startedAt = Date.now();
    const accumulated = new Map();
    const sourceItems = new Set();
    let stopReason = 'round_limit';

    function collectVisible() {
      expandVisibleResults(document, window.location.href);
      for (const record of extractJobRecords(document, window.location.href)) {
        const key = localRecordKey(record);
        accumulated.set(key, mergeRecord(accumulated.get(key), record));
        sourceItems.add(record.sourceItemId ?? record.sourceUrl);
      }
    }

    if (shouldResetToTop(window.location.href) && window.scrollY > 40) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      await sleep(700);
    }
    collectVisible();

    for (let round = 1; round <= rounds; round += 1) {
      if (cancelledRequests.has(requestId)) {
        return { cancelled: true, jobs: [], loginRequired: false, roundsCompleted, partial: true, sourceItemsScanned: sourceItems.size, ...scanMetrics([]) };
      }
      window.scrollBy({ top: Math.max(window.innerHeight * 0.84, 640), left: 0, behavior: 'smooth' });
      await sleep(760);
      collectVisible();
      roundsCompleted = round;
      try {
        await chrome.runtime.sendMessage({ internalType: 'QADDEM_SCANNER_PROGRESS', requestId, currentRound: round, totalRounds: rounds });
      } catch { /* optional */ }
      const nextHeight = document.documentElement.scrollHeight;
      stableRounds = nextHeight <= previousHeight ? stableRounds + 1 : 0;
      previousHeight = nextHeight;
      if (stableRounds >= 4) { stopReason = 'stable'; break; }
      if (Date.now() - startedAt > 40_000) { stopReason = 'timeout'; break; }
      if (sourceItems.size >= 400 || accumulated.size >= 450) { stopReason = 'limit'; break; }
    }

    collectVisible();
    const allJobs = dedupeLocalRecords(Array.from(accumulated.values()));
    const jobs = allJobs.slice(0, 400);
    const truncated = allJobs.length > jobs.length || stopReason === 'limit';
    const partial = stopReason === 'timeout' || stopReason === 'limit' || (stopReason === 'round_limit' && stableRounds < 4);
    return {
      cancelled: false,
      jobs,
      loginRequired: detectLoginRequired(document, window.location.href, jobs.length),
      roundsCompleted,
      partial,
      truncated,
      stopReason,
      sourceItemsScanned: sourceItems.size,
      ...scanMetrics(jobs),
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
      runScan(message).then(sendResponse).catch(() => sendResponse({
        cancelled: false, jobs: [], loginRequired: false, roundsCompleted: 0,
        partial: true, truncated: false, sourceItemsScanned: 0,
        confirmedCount: 0, potentialCount: 0, needsOcrCount: 0, incompleteCount: 0,
        error: 'تعذر فحص الصفحة المفتوحة.',
      }));
      return true;
    });
  }

  return {
    detectSourcePlatform,
    dedupeLocalRecords,
    extractCompany,
    extractJobRecords,
    extractLocations,
    extractTitleCandidates,
    extractXJobRecords,
    findExplicitTitle,
    installRuntimeListener,
    meaningfulImageUrl,
    normalizeText,
    parseCandidateSnapshot,
    parseXSnapshot,
    reviewStatusForRecord,
    scanMetrics,
    sourceAdapterForUrl,
    unwrapSearchRedirect,
    xTweetSnapshot,
  };
});
