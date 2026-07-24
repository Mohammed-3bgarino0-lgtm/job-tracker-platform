// Content Script with JSON-LD JobPosting Parser & Floating "حفظ في قدّم" Button

(function() {
  console.log("⚡ تم تفعيل إضافة قدّم | Qaddem AI على هذه الصفحة!");

  // Parse Schema.org JobPosting JSON-LD
  function parseJobPostingJSONLD() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (let script of scripts) {
      try {
        const json = JSON.parse(script.innerText);
        const data = Array.isArray(json) ? json.find(item => item['@type'] === 'JobPosting') : (json['@type'] === 'JobPosting' ? json : null);
        if (data) {
          return {
            title: data.title || '',
            company: data.hiringOrganization?.name || '',
            city: data.jobLocation?.address?.addressLocality || 'الرياض',
            description: data.description || '',
            url: window.location.href
          };
        }
      } catch (e) {}
    }
    return null;
  }

  // Inject Floating "Save to Qaddem" Button
  function injectSaveButton() {
    if (document.getElementById('qaddem-floating-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'qaddem-floating-btn';
    btn.className = 'qaddem-floating-btn';
    btn.innerHTML = `📌 حفظ في قدّم`;
    
    btn.addEventListener('click', () => {
      const jsonLdData = parseJobPostingJSONLD();
      const pageTitle = jsonLdData ? jsonLdData.title : document.title;
      const company = jsonLdData ? jsonLdData.company : 'الجهة المعلنة';
      const visibleText = document.body.innerText.slice(0, 800);

      const emails = visibleText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      const phones = visibleText.match(/(?:05|\+9665)[0-9]{8}/g) || [];

      const jobRecord = {
        title: pageTitle,
        company,
        email: emails[0] || '',
        phone: phones[0] || '',
        url: window.location.href,
        timestamp: new Date().toISOString()
      };

      chrome.runtime.sendMessage({ action: "saveJobPosting", jobData: jobRecord }, (res) => {
        alert(`✅ تم التقاط الإعلان وحفظه في حسابك بقدّم!\nالعنوان: ${pageTitle}\nالشركة: ${company}\nالإيميل المستخرج: ${emails[0] || 'غير محدد'}`);
      });
    });

    document.body.appendChild(btn);
  }

  setTimeout(injectSaveButton, 1500);
})();
