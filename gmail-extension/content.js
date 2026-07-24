// Gmail Auto-Scraper & HTML Pitch Assistant - Mohammed Al-Sakran

(function() {
    console.log("🤖 مساعد سحب الإيميلات والتقديم الـ HTML في Gmail مفعّل لمحمد السكران!");

    // Inject Floating Widget into Gmail
    function injectWidget() {
        if (document.getElementById('sakran-gmail-widget')) return;

        const widget = document.createElement('div');
        widget.id = 'sakran-gmail-widget';
        widget.className = 'sakran-job-widget';
        widget.innerHTML = `
            <div class="sakran-widget-header">
                <h3>📧 سحب الإيميلات وترشيح HTML | Gmail</h3>
                <span style="font-size: 11px; color: #10b981;">● جاهز</span>
            </div>
            
            <textarea id="sakran-job-ad" class="sakran-input" style="height: 60px;" placeholder="الصق نص الإعلان أو الإيميل وسيقوم البوت بسحب البيانات..."></textarea>

            <button id="sakran-scrape-btn" class="sakran-btn">⚡ سحب الإيميل وتوليد إيميل HTML منمّق</button>
            <button id="sakran-attach-btn" class="sakran-btn sakran-btn-green">📎 إضافة السيرة الذاتية (CV Attached)</button>
        `;

        document.body.appendChild(widget);

        // Bind events
        document.getElementById('sakran-scrape-btn').addEventListener('click', scrapeAndFillHtml);
        document.getElementById('sakran-attach-btn').addEventListener('click', attachCvNotice);
    }

    function scrapeAndFillHtml() {
        const text = document.getElementById('sakran-job-ad').value.trim();
        let extractedEmail = "";
        let jobTitle = "طلب توظيف - مشرف إداري وتطوير عمليات";

        if (text) {
            const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            if (emailMatch) extractedEmail = emailMatch[0];

            if (text.includes("مشرف") || text.includes("Admin")) jobTitle = "مشرف إداري / Admin Supervisor";
            if (text.includes("عمليات") || text.includes("Operations")) jobTitle = "مدير عمليات / Operations Manager";
            if (text.includes("موارد بشرية") || text.includes("HR")) jobTitle = "أخصائي موارد بشرية / HR Executive";
        }

        const subjectText = `طلب توظيف: ${jobTitle} - محمد السكران`;
        
        const htmlBody = `
<div style="direction: rtl; font-family: Arial, sans-serif; background-color: #ffffff; padding: 16px; border: 1px solid #cbd5e1; border-radius: 8px;">
    <p><strong>السادة / فريق التوظيف والموارد البشرية المحترمين،</strong></p>
    <p>السلام عليكم ورحمة الله وبركاته،،</p>
    <p>أتقدم إليكم برغبتي الجادة في التقديم على شاغر (<strong>${jobTitle}</strong>).</p>
    <p>بفضل خبرتي الممتدة في مجالات الإشراف الإداري، إدارة العمليات، الموارد البشرية، والخدمات اللوجستية وتطبيق أنظمة SOPs وSAP/Odoo وخفض التكاليف 60%، أثق بتقديم إضافة ملموسة لفريقكم.</p>
    <p style="background: #f1f5f9; padding: 10px; border-right: 4px solid #3b82f6;">📌 <strong>مرفق مع الرسالة:</strong> السيرة الذاتية المفصلة (PDF) لمحمد السكران.</p>
    <p>وتقبلوا فائق الاحترام والتقدير،،</p>
    <hr>
    <strong>محمد السكران | 0539491361 | mohammed-alsakran@hotmail.com</strong>
</div>
        `;

        // Gmail compose inputs
        const toBox = document.querySelector('input[peoplekit-input-target="true"], div[aria-label="إلى"], input[aria-label="To"]');
        const subjectBox = document.querySelector('input[name="subjectbox"]');
        const bodyBox = document.querySelector('div[aria-label="محتوى الرسالة"], div[aria-label="Message Body"]');

        if (extractedEmail && toBox) {
            toBox.value = extractedEmail;
            toBox.dispatchEvent(new Event('input', { bubbles: true }));
        }

        if (subjectBox) {
            subjectBox.value = subjectText;
            subjectBox.dispatchEvent(new Event('input', { bubbles: true }));
        }

        if (bodyBox) {
            bodyBox.innerHTML = htmlBody;
            bodyBox.dispatchEvent(new Event('input', { bubbles: true }));
            alert('⚡ تم سحب الإيميل والوصف وتوليد رسالة الـ HTML المنمقة في Gmail!');
        } else {
            alert('💡 يُرجى فتح نافذة إنشاء رسالة جديدة (Compose) أولاً في Gmail ليقوم البوت بتعبئة الـ HTML تلقائياً!');
        }
    }

    function attachCvNotice() {
        alert('📎 تم تجهيز تدوين إرفاق السيرة الذاتية (Mohammed_AlSakran_CV.pdf) في الإيميل بنجاح!');
    }

    setTimeout(injectWidget, 3000);
})();
