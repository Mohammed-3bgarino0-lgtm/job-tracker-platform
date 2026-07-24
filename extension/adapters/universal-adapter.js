// Universal Job Source Analyzer - Qaddem AI v1.2

window.UniversalAdapter = {
  name: "Universal Job Source Analyzer",
  version: "1.2.0",

  extractFromText: function(text, sourceUrl = '') {
    // 1. All Emails
    const emails = Array.from(new Set(text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []));

    // 2. All Phones / WhatsApp
    const phones = Array.from(new Set(text.match(/(?:05|\+9665|\+967|\+971|\+965|\+968|\+973)[0-9]{8,10}/g) || []));

    // 3. Application Forms & Google Forms
    const forms = Array.from(new Set(text.match(/https?:\/\/(?:docs\.google\.com\/forms|forms\.gle|t\.co|typeform\.com)[^\s]+/gi) || []));

    // 4. External Apply Links
    const links = Array.from(new Set(text.match(/https?:\/\/[^\s]+/gi) || [])).filter(l => !forms.includes(l));

    // 5. Gender Target Detection
    let genderTarget = 'both';
    let genderLabel = '👫 للرجال والنساء';
    let badgeClass = 'badge-both';
    if (text.includes('نساء') || text.includes('إناث') || text.includes('منسقة') || text.includes('أخصائية')) {
      genderTarget = 'female';
      genderLabel = '👩 للنساء فقط';
      badgeClass = 'badge-female';
    } else if (text.includes('رجال') || text.includes('ذكور') || text.includes('سائق')) {
      genderTarget = 'male';
      genderLabel = '👨 للرجال فقط';
      badgeClass = 'badge-male';
    }

    // 6. Subject Line Instructions
    let subjectInstruction = '';
    const subjMatch = text.match(/(?:عنوان الرسالة|كتابة المسمى|العنوان):\s*([^\n.]+)/i);
    if (subjMatch) {
      subjectInstruction = subjMatch[1].trim();
    }

    // 7. Title & City Extraction
    let title = 'فرصة وظيفية معلنة';
    const titleMatch = text.match(/(?:وظيفة|مطلوب|مسميات|منسقة|أخصائي|أخصائية|مشرف|مدير|مديرة|مهندس)\s+([^\n.:-]+)/i);
    if (titleMatch) {
      title = titleMatch[0].trim();
    }

    let city = 'المملكة العربية السعودية';
    if (text.includes('الرياض')) city = 'الرياض';
    else if (text.includes('جدة')) city = 'جدة';
    else if (text.includes('الدمام') || text.includes('الخبر')) city = 'الشرقية';

    // Application Channel Categorization
    let channel = 'link';
    if (emails.length > 0) channel = 'email';
    else if (forms.length > 0) channel = 'form';
    else if (phones.length > 0) channel = 'whatsapp';

    return {
      id: 'job-' + Math.random().toString(36).substr(2, 9),
      title,
      company: 'الجهة المعلنة',
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
      badgeClass,
      date: new Date().toISOString().split('T')[0],
      rawText: text.slice(0, 500)
    };
  },

  parseVisiblePageJobs: function() {
    const results = [];
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    
    // Parse Schema.org JobPosting if exists
    jsonLdScripts.forEach(s => {
      try {
        const data = JSON.parse(s.innerText);
        const postings = Array.isArray(data) ? data.filter(d => d['@type'] === 'JobPosting') : (data['@type'] === 'JobPosting' ? [data] : []);
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
            subjectInstruction: p.title + ' - الرياض',
            channel: 'link',
            genderTarget: 'both',
            genderLabel: '👫 للرجال والنساء',
            badgeClass: 'badge-both',
            date: new Date().toISOString().split('T')[0],
            rawText: (p.description || '').slice(0, 300)
          });
        });
      } catch (e) {}
    });

    if (results.length === 0) {
      const pageText = document.body ? document.body.innerText : '';
      if (pageText.length > 30) {
        results.push(this.extractFromText(pageText, window.location.href));
      }
    }

    return results;
  }
};
