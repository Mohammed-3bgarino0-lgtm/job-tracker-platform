// Wdhifaa @Wdhifaa X/Twitter Specialized Job & Email Adapter

window.WdhifaaAdapter = {
  name: "Wdhifaa X Adapter",
  version: "1.1.0",
  
  parsePostText: function(text, postUrl = '') {
    // 1. Extract Email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : '';

    // 2. Extract Phone / WhatsApp
    const phoneMatch = text.match(/(?:05|\+9665)[0-9]{8}/);
    const phone = phoneMatch ? phoneMatch[0] : '';

    // 3. Extract Google Forms or External Link
    const formMatch = text.match(/https?:\/\/(?:docs\.google\.com\/forms|forms\.gle|t\.co)[^\s]+/i);
    const formUrl = formMatch ? formMatch[0] : '';

    // 4. Extract Subject Instructions (e.g., مع كتابة المسمى أو رمز الوظيفة)
    let subjectInstruction = '';
    const subjMatch = text.match(/(?:عنوان الرسالة|كتابة المسمى|العنوان):\s*([^\n.]+)/i);
    if (subjMatch) {
      subjectInstruction = subjMatch[1].trim();
    }

    // 5. Categorize Application Method
    let channel = 'manual';
    if (email) channel = 'email';
    else if (formUrl) channel = 'form';
    else if (phone) channel = 'whatsapp';
    else if (text.includes('صورة') || text.length < 30) channel = 'ocr_needed';

    // 6. Extract City & Title
    let city = 'الرياض';
    if (text.includes('جدة')) city = 'جدة';
    else if (text.includes('الدمام') || text.includes('الخبر')) city = 'الشرقية';
    else if (text.includes('مكة')) city = 'مكة المكرمة';

    let title = 'وظيفة معلنة';
    const titleMatch = text.match(/(?:وظيفة|مطلوب|مسميات|منسقة|أخصائي|مشرف|مدير)\s+([^\n.:-]+)/i);
    if (titleMatch) {
      title = titleMatch[0].trim();
    }

    return {
      title,
      company: 'جهة معلنة عبر @Wdhifaa',
      city,
      email,
      phone,
      formUrl,
      postUrl: postUrl || 'https://x.com/Wdhifaa',
      subjectInstruction: subjectInstruction || `${title} - ${city}`,
      channel,
      date: new Date().toISOString().split('T')[0],
      rawText: text
    };
  },

  scrapeVisibleXPosts: function() {
    const articles = document.querySelectorAll('article[data-testid="tweet"]');
    const results = [];

    articles.forEach(art => {
      const text = art.innerText || '';
      const linkEl = art.querySelector('a[href*="/status/"]');
      const postUrl = linkEl ? 'https://x.com' + linkEl.getAttribute('href') : '';
      if (text.length > 20) {
        results.push(this.parsePostText(text, postUrl));
      }
    });

    return results;
  }
};
