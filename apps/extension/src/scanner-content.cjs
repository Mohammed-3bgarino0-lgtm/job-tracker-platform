(function initializeScanner(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.__QADDEM_SCANNER_INTERNALS__ = api;
  api.installRuntimeListener();
})(globalThis, function createScanner() {
  const JOB_SIGNAL_PATTERN =
    /(?:وظيف|شاغر|توظيف|مطلوب|فرصة\s+(?:عمل|وظيفية)|انضم(?:ام)?\s+إلى\s+فريق|career|vacanc|hiring|job|apply|open\s+positions?|join\s+(?:our|the)\s+team)/iu;
  const STRONG_JOB_SIGNAL_PATTERN =
    /(?:المسمى\s+الوظيفي|المسميات\s+الوظيفية|وظائف\s+شاغرة|فرصة\s+وظيفية|للتقديم|التقديم\s+عبر|مطلوب\s+(?:موظف|موظفة|للتوظيف)|job\s+title|open\s+positions?|vacanc(?:y|ies)|now\s+hiring|apply\s+(?:now|via)|join\s+our\s+team)/iu;
  const NEGATED_JOB_PATTERN =
    /(?:لا\s+(?:يتعلق|يخص|يوجد|توجد)[^.!؟]{0,45}(?:وظيف|توظيف|تقديم)|not\s+(?:a\s+)?(?:job|hiring|vacancy)|no\s+(?:jobs?|vacancies))/iu;
  const APPLY_TEXT_PATTERN =
    /(?:تقديم|قدّم|قدم الآن|التقديم|apply|easy apply|submit application|register)/iu;
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
    /^(?:the\s+following\s+positions?(?:\s+to\s+join.*)?|following\s+positions?|open\s+positions?|available\s+positions?|positions?|job\s+openings?|vacancies|المسميات\s+الوظيفية|الوظائف\s+الشاغرة|الوظائف\s+التالية|الوظائف|المسمى(?:\s+الوظيفي)?|بمسمى|مطلوب|فرصة\s+وظيفية)\s*:?\s*$/iu;
  const STOP_SECTION_PATTERN =
    /^(?:المتطلبات|الشروط|المؤهلات|المهام|المزايا|التفاصيل|الموقع|المدينة|مكان\s+العمل|للتقديم|طريقة\s+التقديم|التقديم|requirements?|qualifications?|responsibilities|benefits?|location|apply|how\s+to\s+apply|working\s+hours?|salary)\b/iu;
  const ROLE_WORD_PATTERN =
    /(?:مهندس|مهندسة|محاسب|محاسبة|مطور|مطورة|مبرمج|مبرمجة|مصمم|مصممة|مدير|مديرة|أخصائي|أخصائية|منسق|منسقة|مسؤول|مسؤولة|مندوب|مندوبة|موظف|موظفة|فني|فنية|ممرض|ممرضة|طبيب|طبيبة|صيدلي|صيدلانية|معلم|معلمة|مدرب|مدربة|مشرف|مشرفة|مراقب|مراقبة|سائق|حارس|كاتب|سكرتير|سكرتيرة|باحث|باحثة|محلل|محللة|استشاري|استشارية|مساعد|مساعدة|operator|engineer|accountant|developer|programmer|designer|manager|specialist|coordinator|officer|representative|technician|nurse|doctor|pharmacist|teacher|trainer|supervisor|analyst|consultant|assistant|receptionist|sales|marketing|hr|human\s+resources|customer\s+service|call\s+center|data\s+entry|project\s+manager|office\s+engineer)/iu;
  const LOCATION_NAMES = [
    'الرياض',
    'جدة',
    'مكة',
    'مكة المكرمة',
    'المدينة',
    'المدينة المنورة',
    'الدمام',
    'الخبر',
    'الظهران',
    'الجبيل',
    'ينبع',
    'الطائف',
    'تبوك',
    'أبها',
    'خميس مشيط',
    'جازان',
    'نجران',
    'حائل',
    'بريدة',
    'عنيزة',
    'القصيم',
    'الأحساء',
    'الهفوف',
    'القطيف',
    'عرعر',
    'سكاكا',
    'الباحة',
    'Riyadh',
    'Jeddah',
    'Makkah',
    'Mecca',
    'Madinah',
    'Medina',
    'Dammam',
    'Khobar',
    'Dhahran',
    'Jubail',
    'Yanbu',
    'Taif',
    'Tabuk',
    'Abha',
    'Khamis Mushait',
    'Jazan',
    'Najran',
    'Hail',
    'Buraidah',
    'Qassim',
    'Al Ahsa',
    'Remote',
    'عن بعد',
  ];
  const cancelledRequests = new Set();

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
    return normalized.length > maxLength
      ? `${normalized.slice(0, maxLength - 1)}…`
      : normalized;
  }

  function clipMultiline(value, maxLength) {
    const normalized = normalizeMultiline(value);
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

  function detectSourcePlatform(input) {
    try {
      const hostname = new URL(input).hostname.toLowerCase();
      if (hostname === 'x.com' || hostname.endsWith('.x.com') || hostname.includes('twitter.com')) {
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

  function cleanTitleCandidate(value) {
    const cleaned = normalizeText(value)
      .replace(/^[\s\-–—•●▪◦·*✓✔✅☑️🔹🔸➡️👉\d.)،,:：]+/u, '')
      .replace(/[\s\-–—•|،,:：]+$/u, '')
      .replace(/^["'“”‘’([{]+|["'“”‘’)\]}]+$/gu, '')
      .trim();

    if (!cleaned || cleaned.length < 2 || cleaned.length > 140) return null;
    if (GENERIC_TITLE_PATTERN.test(cleaned)) return null;
    if (STOP_SECTION_PATTERN.test(cleaned)) return null;
    if (/^(?:https?:\/\/|www\.|@|#)/i.test(cleaned)) return null;
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

    const wordCount = cleaned.split(/\s+/).length;
    return wordCount >= 1 && wordCount <= 8 && !/[.!؟]$/.test(cleaned);
  }

  function splitInlineTitles(value) {
    const cleaned = normalizeText(value);
    if (!cleaned) return [];
    return unique(
      cleaned
        .split(/\s*(?:[|•؛;]|\s+-\s+|\s+\/\s+)\s*/u)
        .map((part) => cleanTitleCandidate(part))
        .filter(Boolean),
    );
  }

  function extractTitleCandidates(rawText) {
    const multiline = normalizeMultiline(rawText);
    const lines = multiline.split('\n').map((line) => line.trim()).filter(Boolean);
    const titles = [];
    let collectFollowing = false;
    let collectedAfterHeading = 0;

    for (const originalLine of lines) {
      const line = originalLine.replace(/^[\s>*]+/u, '').trim();
      if (!line) continue;

      const marker = line.match(
        /^(?:المسمى(?:\s+الوظيفي)?|الوظيفة|الشاغر(?:\s+الوظيفي)?|بمسمى|مطلوب(?:\s+للتوظيف)?|job\s+title|position(?:\s+of)?|hiring\s+for|vacancy)\s*[:：\-–—]\s*(.*)$/iu,
      );
      if (marker) {
        const inline = splitInlineTitles(marker[1]);
        if (inline.length) {
          for (const candidate of inline) {
            if (looksLikeRoleTitle(candidate, true)) titles.push(candidate);
          }
          collectFollowing = false;
        } else {
          collectFollowing = true;
          collectedAfterHeading = 0;
        }
        continue;
      }

      const headingMatch = line.match(
        /^(?:المسميات\s+الوظيفية|الوظائف\s+الشاغرة|الوظائف\s+التالية|الوظائف\s+المتاحة|the\s+following\s+positions?(?:\s+to\s+join.*)?|open\s+positions?|available\s+positions?|job\s+openings?|vacancies)\s*:?\s*(.*)$/iu,
      );
      if (headingMatch) {
        const inline = splitInlineTitles(headingMatch[1]);
        for (const candidate of inline) {
          if (looksLikeRoleTitle(candidate, true)) titles.push(candidate);
        }
        collectFollowing = true;
        collectedAfterHeading = 0;
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
          collectedAfterHeading += 1;
          if (collectedAfterHeading >= 12) collectFollowing = false;
          continue;
        }
        if (collectedAfterHeading > 0 && line.length > 160) collectFollowing = false;
      }

      const bulletMatch = line.match(/^(?:[-–—•●▪◦·*✓✔✅☑️🔹🔸➡️👉]|\d{1,2}[.)-])\s*(.+)$/u);
      if (bulletMatch) {
        const candidate = cleanTitleCandidate(bulletMatch[1]);
        if (candidate && looksLikeRoleTitle(candidate, false)) titles.push(candidate);
      }
    }

    const directPatterns = [
      /(?:المسمى\s+الوظيفي|الوظيفة|بمسمى|شاغر(?:\s+وظيفي)?|مطلوب(?:\s+للتوظيف)?)[\s:：\-–—]+([^\n|•]{2,140})/giu,
      /(?:job\s+title|position(?:\s+of)?|hiring\s+for|vacancy)[\s:：\-–—]+([^\n|•]{2,140})/giu,
    ];
    for (const pattern of directPatterns) {
      for (const match of multiline.matchAll(pattern)) {
        const candidate = cleanTitleCandidate(match[1]);
        if (candidate && looksLikeRoleTitle(candidate, true)) titles.push(candidate);
      }
    }

    return unique(titles).slice(0, 20);
  }

  function findExplicitTitle(text) {
    return extractTitleCandidates(text)[0] ?? null;
  }

  function extractLocations(text) {
    const multiline = normalizeMultiline(text);
    const normalized = normalizeText(multiline);
    const found = [];
    const explicit = multiline.match(
      /(?:^|\n)(?:الموقع|المدينة|مكان\s+العمل|location|city)\s*[:：\-–—]\s*([^\n|•،,.;]{2,80})/iu,
    );
    if (explicit?.[1]) {
      const value = normalizeText(explicit[1]);
      if (value && value.length <= 80) found.push(value);
    }

    for (const name of LOCATION_NAMES) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`(?:^|[^\\p{L}])${escaped}(?:$|[^\\p{L}])`, 'iu').test(normalized)) {
        found.push(name);
      }
    }
    return unique(found).slice(0, 4);
  }

  function extractCompany(text) {
    const multiline = normalizeMultiline(text);
    const patterns = [
      /(?:تعلن|أعلنت)\s+((?:شركة|مجموعة|مؤسسة|مستشفى|جامعة|أكاديمية|مصنع|مركز)\s+.{2,80}?)\s+(?:عن|توفر|فتح|حاجتها)/iu,
      /((?:شركة|مجموعة|مؤسسة|مستشفى|جامعة|أكاديمية|مصنع|مركز)\s+.{2,80}?)\s+(?:تعلن|تبحث|توفر|ترغب)/iu,
      /([A-Z][A-Za-z0-9&.' -]{2,70})\s+(?:is\s+hiring|is\s+seeking|announces|has\s+an?\s+opening)/i,
    ];

    for (const pattern of patterns) {
      const match = multiline.match(pattern);
      const value = clip(match?.[1], 120);
      if (value && !GENERIC_TITLE_PATTERN.test(value)) return value;
    }
    return null;
  }

  function chooseLink(links, pattern) {
    return (
      links.find((link) => pattern.test(`${link.text} ${link.href} ${link.expandedUrl ?? ''}`))
        ?.expandedUrl ??
      links.find((link) => pattern.test(`${link.text} ${link.href}`))?.href ??
      null
    );
  }

  function meaningfulImageUrl(image, pageUrl) {
    const url = absoluteUrl(image?.src, pageUrl);
    if (!url) return null;

    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return null;
    }

    const width = Number(image?.width ?? 0);
    const height = Number(image?.height ?? 0);
    const alt = normalizeText(image?.alt);
    const signature = `${parsed.hostname}${parsed.pathname} ${alt}`.toLowerCase();
    const isXMedia =
      parsed.hostname.toLowerCase() === 'pbs.twimg.com' &&
      parsed.pathname.toLowerCase().includes('/media/');
    const likelyDecoration =
      /(?:profile_images|emoji|avatar|favicon|sprite|icon|logo)/i.test(signature) &&
      !IMAGE_HINT_PATTERN.test(alt);
    const largeEnough = width >= 180 && height >= 100;

    if (likelyDecoration && !isXMedia) return null;
    if (!isXMedia && !largeEnough && !IMAGE_HINT_PATTERN.test(alt)) return null;
    return url;
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

  function reviewStatusForRecord({ title, hasStrongSignal, hasJobSignal, hasContact, imageUrls }) {
    if (title && (hasStrongSignal || hasContact)) return 'confirmed';
    if (title || hasJobSignal || hasContact) return 'potential';
    if (imageUrls.length > 0) return 'needs_ocr';
    return 'incomplete';
  }

  function confidenceForRecord({ title, company, location, hasStrongSignal, hasContact, imageUrls }) {
    let score = 0.2;
    if (title) score += 0.34;
    if (company) score += 0.1;
    if (location) score += 0.08;
    if (hasStrongSignal) score += 0.14;
    if (hasContact) score += 0.1;
    if (imageUrls.length > 0 && !title) score += 0.02;
    return Math.max(0, Math.min(1, Number(score.toFixed(2))));
  }

  function parseCandidateSnapshot(snapshot, pageUrl) {
    const rawText = normalizeMultiline(snapshot.rawText ?? snapshot.text);
    const text = normalizeText(snapshot.text ?? rawText);
    const links = (snapshot.links ?? [])
      .map((link) => ({
        href: absoluteUrl(link.href, pageUrl),
        expandedUrl: absoluteUrl(link.expandedUrl, pageUrl),
        text: normalizeText(link.text),
      }))
      .filter((link) => Boolean(link.href || link.expandedUrl));
    const linkUrls = unique(
      links.flatMap((link) => [link.expandedUrl, link.href]).filter(Boolean),
    );
    const emails = cleanEmailMatches(text);
    const phones = cleanPhoneMatches(text);
    const forms = unique([
      ...(text.match(FORM_PATTERN_GLOBAL) ?? []),
      ...linkUrls.filter((link) => FORM_PATTERN_SINGLE.test(link)),
    ]);
    const imageUrls = unique(
      (snapshot.images ?? [])
        .map((image) => meaningfulImageUrl(image, pageUrl))
        .filter(Boolean),
    ).slice(0, 4);
    const hasJobSignal = JOB_SIGNAL_PATTERN.test(text) && !NEGATED_JOB_PATTERN.test(text);
    const hasStrongSignal = STRONG_JOB_SIGNAL_PATTERN.test(text);
    const hasContact = emails.length > 0 || phones.length > 0 || forms.length > 0;

    if (!hasJobSignal && !hasContact && imageUrls.length === 0) return null;

    const selectorTitle = unique(snapshot.titleTexts ?? [])
      .map((value) => cleanTitleCandidate(value))
      .find((value) => value && looksLikeRoleTitle(value, true));
    const headingTitle = unique(snapshot.headingTexts ?? [])
      .map((value) => cleanTitleCandidate(value))
      .find((value) => value && looksLikeRoleTitle(value, false));
    const title = selectorTitle ?? findExplicitTitle(rawText) ?? headingTitle ?? null;
    const company =
      unique(snapshot.companyTexts ?? [])
        .map((value) => clip(value, 180))
        .find(Boolean) ??
      extractCompany(rawText);
    const locations = unique([
      ...(snapshot.locationTexts ?? []),
      ...extractLocations(rawText),
    ])
      .map((value) => clip(value, 100))
      .filter(Boolean);
    const location = locations.length ? locations.join('، ') : null;

    const statusOrJobUrl = linkUrls.find((link) =>
      /(?:\/status\/\d+|\/jobs?\/view\/|\/jobs?\/|\/careers?\/|\/vacanc(?:y|ies)\/)/i.test(
        link,
      ),
    );
    const sourceUrl = statusOrJobUrl ?? pageUrl;
    const applyUrl = chooseLink(links, APPLY_TEXT_PATTERN) ?? forms[0] ?? null;
    const reviewStatus = reviewStatusForRecord({
      title,
      hasStrongSignal,
      hasJobSignal,
      hasContact,
      imageUrls,
    });
    const confidence = confidenceForRecord({
      title,
      company,
      location,
      hasStrongSignal,
      hasContact,
      imageUrls,
    });

    return {
      sourceUrl,
      sourcePlatform: detectSourcePlatform(sourceUrl),
      title,
      company,
      location,
      description: clipMultiline(rawText, 2000),
      applyUrl,
      emails,
      phones,
      forms,
      imageUrls,
      ocrStatus: imageUrls.length > 0 ? 'not_requested' : 'not_applicable',
      ocrText: null,
      evidence: rawText ? [clip(rawText, 420)].filter(Boolean) : [],
      detectedAt: new Date().toISOString(),
      reviewStatus,
      confidence,
      rawText: clipMultiline(rawText, 5000),
      authorName: snapshot.authorName ?? null,
      authorHandle: snapshot.authorHandle ?? null,
      publishedAt: snapshot.publishedAt ?? null,
      sourceItemId: snapshot.sourceItemId ?? null,
    };
  }

  function textValues(element, selectors) {
    return unique(
      selectors.flatMap((selector) =>
        Array.from(element.querySelectorAll(selector)).map((node) => node.textContent),
      ),
    );
  }

  function linkSnapshot(anchor, baseUrl) {
    const rawHref = anchor.getAttribute('href');
    const expanded =
      anchor.getAttribute('data-expanded-url') ||
      anchor.getAttribute('title') ||
      anchor.dataset?.expandedUrl ||
      null;
    return {
      href: absoluteUrl(rawHref, baseUrl),
      expandedUrl: absoluteUrl(expanded, baseUrl),
      text: anchor.textContent,
    };
  }

  function candidateSnapshot(element, pageUrl) {
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
      links: Array.from(element.querySelectorAll('a[href]')).map((anchor) =>
        linkSnapshot(anchor, pageUrl),
      ),
      images: Array.from(element.querySelectorAll('img[src]')).map((image) => ({
        src: image.currentSrc || image.getAttribute('src'),
        alt: image.getAttribute('alt'),
        width: image.naturalWidth || image.width || 0,
        height: image.naturalHeight || image.height || 0,
      })),
    };
  }

  function tweetPermalink(article, pageUrl) {
    const time = article.querySelector('time');
    const timeLink = time?.closest('a[href]');
    const candidates = [
      timeLink?.getAttribute('href'),
      ...Array.from(article.querySelectorAll('a[href*="/status/"]')).map((anchor) =>
        anchor.getAttribute('href'),
      ),
    ];
    return (
      candidates
        .map((candidate) => absoluteUrl(candidate, pageUrl))
        .find((value) => /\/status\/\d+/i.test(value ?? '')) ?? null
    );
  }

  function tweetAuthor(article) {
    const userNameNode = article.querySelector('[data-testid="User-Name"]');
    const lines = normalizeMultiline(userNameNode?.innerText)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const authorHandle = lines.find((line) => /^@[A-Za-z0-9_]{1,30}$/.test(line)) ?? null;
    const authorName =
      lines.find(
        (line) =>
          line !== authorHandle &&
          !/^·$/.test(line) &&
          !/^\d+[mhdwy]$/i.test(line) &&
          !/^(?:الآن|أمس|\d+\s*(?:د|س|ي))$/u.test(line),
      ) ?? null;
    return { authorName, authorHandle };
  }

  function xExternalApplyLinks(links, sourceUrl) {
    let sourceHost = '';
    try {
      sourceHost = new URL(sourceUrl).hostname.toLowerCase();
    } catch {
      sourceHost = 'x.com';
    }

    return unique(
      links
        .flatMap((link) => [link.expandedUrl, link.href])
        .filter(Boolean)
        .filter((href) => {
          try {
            const url = new URL(href);
            const host = url.hostname.toLowerCase();
            if (
              host === sourceHost ||
              host === 'x.com' ||
              host.endsWith('.x.com') ||
              host.includes('twitter.com')
            ) {
              return false;
            }
            return true;
          } catch {
            return false;
          }
        }),
    );
  }

  function xTweetSnapshot(article, pageUrl) {
    const tweetTextNode = article.querySelector('[data-testid="tweetText"]');
    const rawText = normalizeMultiline(tweetTextNode?.innerText || tweetTextNode?.textContent);
    const sourceUrl = tweetPermalink(article, pageUrl) ?? pageUrl;
    const { authorName, authorHandle } = tweetAuthor(article);
    const time = article.querySelector('time');
    const publishedAt = time?.getAttribute('datetime') || null;
    const sourceItemId = sourceUrl.match(/\/status\/(\d+)/i)?.[1] ?? null;
    const links = Array.from(
      article.querySelectorAll(
        '[data-testid="tweetText"] a[href], [data-testid="card.wrapper"] a[href], a[href*="t.co"]',
      ),
    ).map((anchor) => linkSnapshot(anchor, pageUrl));
    const images = Array.from(
      article.querySelectorAll(
        '[data-testid="tweetPhoto"] img[src], img[src*="pbs.twimg.com/media"]',
      ),
    ).map((image) => ({
      src: image.currentSrc || image.getAttribute('src'),
      alt: image.getAttribute('alt'),
      width: image.naturalWidth || image.width || 0,
      height: image.naturalHeight || image.height || 0,
    }));

    return {
      text: rawText,
      rawText,
      titleTexts: [],
      headingTexts: [],
      companyTexts: [],
      locationTexts: [],
      links,
      images,
      authorName,
      authorHandle,
      publishedAt,
      sourceItemId,
      sourceUrl,
    };
  }

  function parseXSnapshot(snapshot, pageUrl) {
    const rawText = normalizeMultiline(snapshot.rawText);
    const text = normalizeText(rawText);
    const sourceUrl = snapshot.sourceUrl ?? pageUrl;
    const links = snapshot.links ?? [];
    const normalizedLinks = links
      .map((link) => ({
        href: absoluteUrl(link.href, pageUrl),
        expandedUrl: absoluteUrl(link.expandedUrl, pageUrl),
        text: normalizeText(link.text),
      }))
      .filter((link) => Boolean(link.href || link.expandedUrl));
    const allLinkUrls = unique(
      normalizedLinks.flatMap((link) => [link.expandedUrl, link.href]).filter(Boolean),
    );
    const externalApplyLinks = xExternalApplyLinks(normalizedLinks, sourceUrl);
    const emails = cleanEmailMatches(text);
    const phones = cleanPhoneMatches(text);
    const forms = unique([
      ...(text.match(FORM_PATTERN_GLOBAL) ?? []),
      ...allLinkUrls.filter((link) => FORM_PATTERN_SINGLE.test(link)),
    ]);
    const imageUrls = unique(
      (snapshot.images ?? [])
        .map((image) => meaningfulImageUrl(image, pageUrl))
        .filter(Boolean),
    ).slice(0, 4);
    const hasJobSignal = JOB_SIGNAL_PATTERN.test(text) && !NEGATED_JOB_PATTERN.test(text);
    const hasStrongSignal = STRONG_JOB_SIGNAL_PATTERN.test(text);
    const hasContact =
      emails.length > 0 ||
      phones.length > 0 ||
      forms.length > 0 ||
      externalApplyLinks.length > 0;

    if (!hasJobSignal && !hasContact && imageUrls.length === 0) return [];

    const titles = extractTitleCandidates(rawText);
    const company = extractCompany(rawText);
    const locations = extractLocations(rawText);
    const location = locations.length ? locations.join('، ') : null;
    const applyUrl =
      chooseLink(normalizedLinks, APPLY_TEXT_PATTERN) ??
      forms[0] ??
      externalApplyLinks[0] ??
      null;
    const recordTitles = titles.length > 0 ? titles : [null];

    return recordTitles.map((title) => {
      const reviewStatus = reviewStatusForRecord({
        title,
        hasStrongSignal,
        hasJobSignal,
        hasContact,
        imageUrls,
      });
      const confidence = confidenceForRecord({
        title,
        company,
        location,
        hasStrongSignal,
        hasContact,
        imageUrls,
      });

      return {
        sourceUrl,
        sourcePlatform: 'x',
        title,
        company,
        location,
        description: clipMultiline(rawText, 2000),
        applyUrl,
        emails,
        phones,
        forms,
        imageUrls,
        ocrStatus: imageUrls.length > 0 ? 'not_requested' : 'not_applicable',
        ocrText: null,
        evidence: unique([
          title ? `المسمى المستخرج: ${title}` : null,
          rawText ? clip(rawText, 420) : null,
        ].filter(Boolean)),
        detectedAt: new Date().toISOString(),
        reviewStatus,
        confidence,
        rawText: clipMultiline(rawText, 5000),
        authorName: snapshot.authorName ?? null,
        authorHandle: snapshot.authorHandle ?? null,
        publishedAt: snapshot.publishedAt ?? null,
        sourceItemId: snapshot.sourceItemId ?? null,
      };
    });
  }

  function collectCandidateElements(documentObject) {
    const candidates = new Set();
    const selectors = [
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
        if (candidates.size >= 300) return Array.from(candidates);
      }
    }

    if (candidates.size < 300) {
      for (const element of documentObject.querySelectorAll('article, main li')) {
        const text = normalizeText(element.textContent);
        const hasLargeImage = Array.from(element.querySelectorAll('img[src]')).some(
          (image) =>
            (image.naturalWidth || image.width || 0) >= 180 &&
            (image.naturalHeight || image.height || 0) >= 100,
        );
        if (
          text.length >= 40 &&
          text.length <= 12_000 &&
          ((JOB_SIGNAL_PATTERN.test(text) && !NEGATED_JOB_PATTERN.test(text)) || hasLargeImage)
        ) {
          candidates.add(element);
        }
        if (candidates.size >= 300) break;
      }
    }

    if (candidates.size === 0) {
      const main = documentObject.querySelector('main');
      const text = normalizeText(main?.textContent);
      if (
        main &&
        text.length >= 40 &&
        JOB_SIGNAL_PATTERN.test(text) &&
        !NEGATED_JOB_PATTERN.test(text)
      ) {
        candidates.add(main);
      }
    }

    return Array.from(candidates);
  }

  function extractXJobRecords(documentObject, pageUrl) {
    return Array.from(documentObject.querySelectorAll('article[data-testid="tweet"]'))
      .flatMap((article) => parseXSnapshot(xTweetSnapshot(article, pageUrl), pageUrl))
      .slice(0, 300);
  }

  function extractJobRecords(documentObject, pageUrl) {
    if (detectSourcePlatform(pageUrl) === 'x') {
      return extractXJobRecords(documentObject, pageUrl);
    }
    return collectCandidateElements(documentObject)
      .map((element) => parseCandidateSnapshot(candidateSnapshot(element, pageUrl), pageUrl))
      .filter(Boolean)
      .slice(0, 300);
  }

  function canonicalSourceUrl(value) {
    try {
      const url = new URL(value);
      url.hash = '';
      for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
        url.searchParams.delete(key);
      }
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
    const imageUrls = unique([...(current.imageUrls ?? []), ...(incoming.imageUrls ?? [])]);
    const statusRank = { confirmed: 4, potential: 3, needs_ocr: 2, incomplete: 1 };
    const reviewStatus =
      statusRank[incoming.reviewStatus] > statusRank[current.reviewStatus]
        ? incoming.reviewStatus
        : current.reviewStatus;

    return {
      ...current,
      title: current.title ?? incoming.title,
      company: current.company ?? incoming.company,
      location: current.location ?? incoming.location,
      description:
        String(incoming.description ?? '').length > String(current.description ?? '').length
          ? incoming.description
          : current.description,
      applyUrl: current.applyUrl ?? incoming.applyUrl,
      emails: unique([...(current.emails ?? []), ...(incoming.emails ?? [])]),
      phones: unique([...(current.phones ?? []), ...(incoming.phones ?? [])]),
      forms: unique([...(current.forms ?? []), ...(incoming.forms ?? [])]),
      imageUrls,
      ocrStatus:
        current.ocrStatus === 'complete' || incoming.ocrStatus === 'complete'
          ? 'complete'
          : imageUrls.length
            ? 'not_requested'
            : 'not_applicable',
      ocrText:
        String(incoming.ocrText ?? '').length > String(current.ocrText ?? '').length
          ? incoming.ocrText
          : current.ocrText,
      evidence: unique([...(current.evidence ?? []), ...(incoming.evidence ?? [])]),
      reviewStatus,
      confidence: Math.max(Number(current.confidence ?? 0), Number(incoming.confidence ?? 0)),
      rawText:
        String(incoming.rawText ?? '').length > String(current.rawText ?? '').length
          ? incoming.rawText
          : current.rawText,
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
      confirmedCount: records.filter((record) => record.reviewStatus === 'confirmed').length,
      potentialCount: records.filter((record) => record.reviewStatus === 'potential').length,
      needsOcrCount: records.filter((record) => record.reviewStatus === 'needs_ocr').length,
      incompleteCount: records.filter((record) => record.reviewStatus === 'incomplete').length,
    };
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

  function expandVisibleXPosts(documentObject) {
    if (detectSourcePlatform(window.location.href) !== 'x') return;
    const controls = Array.from(
      documentObject.querySelectorAll(
        'article[data-testid="tweet"] [data-testid="tweet-text-show-more-link"], article[data-testid="tweet"] [role="button"]',
      ),
    );
    for (const control of controls) {
      const label = normalizeText(control.textContent);
      if (/^(?:show\s+more|عرض\s+المزيد)$/iu.test(label)) {
        try {
          control.click();
        } catch {
          // Expansion is best-effort; scanning continues with visible text.
        }
      }
    }
  }

  function shouldResetXProfileToTop(pageUrl) {
    try {
      const url = new URL(pageUrl);
      return (
        detectSourcePlatform(pageUrl) === 'x' &&
        !/\/status\/\d+/i.test(url.pathname) &&
        /^\/[A-Za-z0-9_]{1,30}\/?$/.test(url.pathname)
      );
    } catch {
      return false;
    }
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
      expandVisibleXPosts(document);
      const records = extractJobRecords(document, window.location.href);
      for (const record of records) {
        const key = localRecordKey(record);
        accumulated.set(key, mergeRecord(accumulated.get(key), record));
        sourceItems.add(record.sourceItemId ?? record.sourceUrl);
      }
    }

    if (shouldResetXProfileToTop(window.location.href) && window.scrollY > 40) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      await sleep(700);
    }

    collectVisible();

    for (let round = 1; round <= rounds; round += 1) {
      if (cancelledRequests.has(requestId)) {
        return {
          cancelled: true,
          jobs: [],
          loginRequired: false,
          roundsCompleted,
          partial: true,
          sourceItemsScanned: sourceItems.size,
          ...scanMetrics([]),
        };
      }

      window.scrollBy({
        top: Math.max(window.innerHeight * 0.82, 620),
        left: 0,
        behavior: 'smooth',
      });
      await sleep(720);
      collectVisible();
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

      if (stableRounds >= 4) {
        stopReason = 'stable';
        break;
      }
      if (Date.now() - startedAt > 35_000) {
        stopReason = 'timeout';
        break;
      }
      if (sourceItems.size >= 300 || accumulated.size >= 350) {
        stopReason = 'limit';
        break;
      }
    }

    collectVisible();
    const allJobs = dedupeLocalRecords(Array.from(accumulated.values()));
    const jobs = allJobs.slice(0, 300);
    const metrics = scanMetrics(jobs);
    const truncated = allJobs.length > jobs.length || stopReason === 'limit';
    const partial =
      stopReason === 'timeout' ||
      stopReason === 'limit' ||
      (stopReason === 'round_limit' && stableRounds < 4);

    return {
      cancelled: false,
      jobs,
      loginRequired: detectLoginRequired(document, window.location.href, jobs.length),
      roundsCompleted,
      partial,
      truncated,
      stopReason,
      sourceItemsScanned: sourceItems.size,
      ...metrics,
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
            truncated: false,
            sourceItemsScanned: 0,
            confirmedCount: 0,
            potentialCount: 0,
            needsOcrCount: 0,
            incompleteCount: 0,
            error: 'تعذر فحص الصفحة المفتوحة.',
          }),
        );
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
    xTweetSnapshot,
  };
});
