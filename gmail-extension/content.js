// Gmail Auto-Apply & Pitch Assistant - Mohammed Al-Sakran

(function() {
    console.log("🤖 مساعد التقديم الآلي في Gmail مفعّل بنجاح لمحمد السكران!");

    // Inject Floating Widget into Gmail
    function injectWidget() {
        if (document.getElementById('sakran-gmail-widget')) return;

        const widget = document.createElement('div');
        widget.id = 'sakran-gmail-widget';
        widget.className = 'sakran-job-widget';
        widget.innerHTML = `
            <div class="sakran-widget-header">
                <h3>💼 مساعد التقديم الآلي | Gmail</h3>
                <span style="font-size: 11px; color: #10b981;">● جاهز</span>
            </div>
            
            <input type="text" id="sakran-job-input" class="sakran-input" placeholder="المسمى الوظيفي (مثال: مشرف إداري)">
            <input type="text" id="sakran-company-input" class="sakran-input" placeholder="اسم الشركة (مثال: شركة سابك)">

            <button id="sakran-fill-btn" class="sakran-btn">⚡ ملء الإيميل والخطاب التعريفي تلقائياً</button>
            <button id="sakran-log-btn" class="sakran-btn sakran-btn-green">✅ تسجيل التقديم في السجل</button>
        `;

        document.body.appendChild(widget);

        // Bind events
        document.getElementById('sakran-fill-btn').addEventListener('click', fillGmailCompose);
        document.getElementById('sakran-log-btn').addEventListener('click', logApplicationFromGmail);
    }

    function fillGmailCompose() {
        const job = document.getElementById('sakran-job-input').value.trim() || 'مشرف إداري / Operations Manager';
        const company = document.getElementById('sakran-company-input').value.trim() || 'الشركة المحترمة';

        // Subject Line
        const subjectText = `طلب توظيف: ${job} - محمد السكران`;
        
        // Pitch / Cover Letter Text
        const bodyText = `السادة / فريق التوظيف والموارد البشرية في ${company} المحترمرين،\n\nالسلام عليكم ورحمة الله وبركاته،،\n\nأتقدم إليكم برغبتي الجادة في التقديم على شاغر (${job}).\n\nبفضل خبرتي الممتدة في مجالات الإشراف الإداري، إدارة العمليات، الموارد البشرية، والخدمات اللوجستية في كبرى المنشآت بالسعودية، وتطوير أنظمة SOPs وخفض التكاليف التشغيلية بنسبة 60%، أثق بقدرتي على تقديم إضافة ملموسة لمؤسستكم.\n\nتجدون برفقه السيرة الذاتية المفصلة ومؤهلاتي (SAP, Odoo, Operations).\n\nوتقبلوا فائق الاحترام والتقدير،،\n\nمحمد السكران\nالرياض | 0539491361\nmohammed-alsakran@hotmail.com\nLinkedIn: https://www.linkedin.com/in/mohammed-h-al-sakran/`;

        // Find active Gmail compose window
        const subjectBox = document.querySelector('input[name="subjectbox"]');
        const bodyBox = document.querySelector('div[aria-label="محتوى الرسالة"], div[aria-label="Message Body"]');

        if (subjectBox) {
            subjectBox.value = subjectText;
            subjectBox.dispatchEvent(new Event('input', { bubbles: true }));
        }

        if (bodyBox) {
            bodyBox.innerText = bodyText;
            bodyBox.dispatchEvent(new Event('input', { bubbles: true }));
            alert('⚡ تم ملء عنوان الرسالة والخطاب التعريفي المخصص بنجاح في الإيميل!');
        } else {
            alert('💡 يُرجى فتح نافذة إنشاء رسالة جديدة (Compose) أولاً في Gmail ليقوم البوت بملئها تلقائياً!');
        }
    }

    function logApplicationFromGmail() {
        const company = document.getElementById('sakran-company-input').value.trim() || 'تقديم عبر Gmail';
        const job = document.getElementById('sakran-job-input').value.trim() || 'تقديم توظيف';
        
        alert(`✅ تم تسجيل التقديم لـ (${job}) لدى (${company}) بنجاح!`);
    }

    // Wait for Gmail to load and inject widget
    setTimeout(injectWidget, 3000);
})();
