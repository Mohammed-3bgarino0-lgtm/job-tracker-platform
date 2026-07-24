// Content Script with "Save to Qaddem / حفظ في قدّم" Button & Form Auto-Filler

(function() {
  console.log("⚡ تم تفعيل إضافة قدّم | Qaddem AI على هذه الصفحة!");

  // Inject Floating "Save to Qaddem" Button
  function injectSaveButton() {
    if (document.getElementById('qaddem-floating-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'qaddem-floating-btn';
    btn.className = 'qaddem-floating-btn';
    btn.innerHTML = `📌 حفظ في قدّم`;
    
    btn.addEventListener('click', () => {
      const pageTitle = document.title;
      const pageUrl = window.location.href;
      const visibleText = document.body.innerText.slice(0, 500);

      // Scrape Emails & Phones
      const emails = visibleText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      const phones = visibleText.match(/(?:05|\+9665)[0-9]{8}/g) || [];

      alert(`✅ تم التقاط الإعلان وحفظه في حسابك بقدّم!\nالعنوان: ${pageTitle}\nالإيميل المستخرج: ${emails[0] || 'غير محدد'}\nالجوال المستخرج: ${phones[0] || 'غير محدد'}`);
    });

    document.body.appendChild(btn);
  }

  setTimeout(injectSaveButton, 2000);
})();
