// Universal Job Parser & Card Engine v1.3 - Zero Fallbacks & Independent Card Parser

window.UniversalAdapter = {
  name: "Universal Job Parser",
  version: "1.3.0",

  extractFromSingleCard: function(text, sourceUrl = '') {
    if (!text || text.trim().length < 15) return null;

    // 1. All Emails
    const emails = Array.from(new Set(text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []));

    // 2. All Phones / WhatsApp
    const phones = Array.from(new Set(text.match(/(?:05|\+9665|\+967|\+971|\+965|\+968|\+973)[0-9]{8,10}/g) || []));

    // 3. Application Forms
    const forms = Array.from(new Set(text.match(/https?:\/\/(?:docs\.google\.com\/forms|forms\.gle|t\.co|typeform\.com)[^\s]+/gi) || []));

    // 4. External Apply Links
    const links = Array.from(new Set(text.match(/https?:\/\/[^\s]+/gi) || [])).filter(l => !forms.includes(l));

    // If no emails, phones, or forms, and text is short, ignore or mark as image/OCR
    if (emails.length === 0 && phones.length === 0 && forms.length === 0 && links.length === 0) {
      if (text.includes('صورة') || text.includes('إعلان')) {
        return {
          id: 'card-' + Math.random().toString(36).substr(2, 9),
          title: 'إعلان مصور (يحتاج قراءة OCR)',
          company: 'جهة معلنة',
          city: 'المملكة العربية السعودية',
          emails: [],
          phones: [],
          forms: [],
          links: [],
          sourceUrl: sourceUrl || window.location.href,
          subjectInstruction: 'طلب توظيف',
          channel: 'ocr_needed',
          genderTarget: 'both',
          genderLabel: '👫 للرجال والنساء',
          date: new Date().toISOString().split('T')[0],
          rawText: text.slice(0, 300)
        };
      }
      return null;
    }

    // Gender Target Detection
    let genderTarget = 'both';
    let genderLabel = '👫 للرجال والنساء';
    if (text.includes('نساء') || text.includes('إناث') || text.includes('منسقة') || text.includes('أخصائية')) {
      genderTarget = 'female';
      genderLabel = '👩 للنساء فقط';
    } else if (text.includes('رجال') || text.includes('ذكور') || text.includes('سائق')) {
      genderTarget = 'male';
      genderLabel = '👨 للرجال فقط';
    }

    // Subject Line Instruction
    let subjectInstruction = '';
    const subjMatch = text.match(/(?:عنوان الرسالة|كتابة المسمى|العنوان):\s*([^\n.]+)/i);
    if (subjMatch) {
      subjectInstruction = subjMatch[1].trim();
    }

    // Title & City
    let title = 'فرصة وظيفية معلنة';
    const titleMatch = text.match(/(?:وظيفة|مطلوب|مسميات|منسقة|أخصائي|أخصائية|مشرف|مدير|مديرة|مهندس)\s+([^\n.:-]+)/i);
    if (titleMatch) {
      title = titleMatch[0].trim();
    }

    let city = 'المملكة العربية السعودية';
    if (text.includes('الرياض')) city = 'الرياض';
    else if (text.includes('جدة')) city = 'جدة';
    else if (text.includes('الدمام') || text.includes('الخبر')) city = 'الشرقية';

    // Channel Categorization
    let channel = 'link';
    if (emails.length > 0) channel = 'email';
    else if (forms.length > 0) channel = 'form';
    else if (phones.length > 0) channel = 'whatsapp';

    return {
      id: 'card-' + Math.random().toString(36).substr(2, 9),
      title,
      company: 'جهة معلنة',
      city,
      emails,
      phones,
      forms,
      links,
      primaryEmail: emails[0] || '',
      primaryPhone: phones[0] || '',
      primaryForm: forms[0] || '',
      primaryLink: links[0] || sourceUrl,
      sourceUrl: sourceUrl || window.location.href,
      subjectInstruction: subjectInstruction || `${title} - ${city}`,
      channel,
      genderTarget,
      genderLabel,
      date: new Date().toISOString().split('T')[0],
      rawText: text.slice(0, 400)
    };
  },

  parseVisiblePageJobs: function() {
    const results = [];

    // 1. JSON-LD Graph Support
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    jsonLdScripts.forEach(s => {
      try {
        const data = JSON.parse(s.innerText);
        let items = [];
        if (Array.isArray(data)) items = data;
        else if (data['@graph'] && Array.isArray(data['@graph'])) items = data['@graph'];
        else items = [data];

        const postings = items.filter(d => d && d['@type'] === 'JobPosting');
        postings.forEach(p => {
          results.push({
            id: 'ld-' + Math.random().toString(36).substr(2, 9),
            title: p.title || 'وظيفة معلنة',
            company: p.hiringOrganization?.name || 'شركة معلنة',
            city: p.jobLocation?.address?.addressLocality || 'الرياض',
            emails: (p.description || '').match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [],
            phones: (p.description || '').match(/(?:05|\+9665)[0-9]{8}/g) || [],
            forms: [],
            links: [window.location.href],
            primaryEmail: '',
            primaryPhone: '',
            primaryForm: '',
            primaryLink: window.location.href,
            sourceUrl: window.location.href,
            subjectInstruction: (p.title || 'طلب توظيف') + ' - الرياض',
            channel: 'link',
            genderTarget: 'both',
            genderLabel: '👫 للرجال والنساء',
            date: new Date().toISOString().split('T')[0],
            rawText: (p.description || '').slice(0, 300)
          });
        });
      } catch (e) {}
    });

    // 2. Scan Independent X Posts / DOM Job Cards
    if (results.length === 0) {
      const articles = document.querySelectorAll('article[data-testid="tweet"], .job-card, .job-listing, .job-item');
      if (articles.length > 0) {
        articles.forEach(art => {
          const text = art.innerText || '';
          const linkEl = art.querySelector('a[href*="/status/"], a[href*="/jobs/"]');
          const postUrl = linkEl ? (linkEl.href.startsWith('http') ? linkEl.href : 'https://x.com' + linkEl.getAttribute('href')) : window.location.href;
          const parsed = this.extractFromSingleCard(text, postUrl);
          if (parsed) results.push(parsed);
        });
      }
    }

    return results;
  }
};
