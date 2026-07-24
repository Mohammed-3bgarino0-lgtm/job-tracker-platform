// Sidepanel Script for Wdhifaa Scraper & EML Generator

let activeJobs = [];

function scrapeWdhifaaPosts() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        if (window.WdhifaaAdapter) {
          return window.WdhifaaAdapter.scrapeVisibleXPosts();
        }
        return [];
      }
    }, (results) => {
      if (results && results[0] && results[0].result) {
        activeJobs = results[0].result;
        renderJobsList(activeJobs);
      } else {
        // Fallback sample Wdhifaa post
        activeJobs = [
          {
            title: 'منسقة مواعيد لدكتورة جلدية وتجميل',
            company: 'عيادات جلدية بالرياض',
            city: 'الرياض',
            email: 'hr@clinic-beauty.com',
            phone: '0537510028',
            formUrl: '',
            subjectInstruction: 'منسقة مواعيد - الرياض',
            channel: 'whatsapp',
            date: '2026-07-24'
          }
        ];
        renderJobsList(activeJobs);
      }
    });
  });
}

function renderJobsList(jobs) {
  const container = document.getElementById('wdhifaa-scraped-list');
  container.innerHTML = '';

  if (jobs.length === 0) {
    container.innerHTML = '<div style="font-size:11px; color:#64748b; text-center">لم يتم اكتشاف منشورات ظاهرة بعد. افحص صفحة x.com/Wdhifaa ومرر للأسفل.</div>';
    return;
  }

  jobs.forEach((j, idx) => {
    let tagClass = 'tag-email';
    let tagLabel = 'بريد إلكتروني';
    if (j.channel === 'whatsapp') { tagClass = 'tag-whatsapp'; tagLabel = 'واتساب مباشر'; }
    else if (j.channel === 'form') { tagClass = 'tag-form'; tagLabel = 'نموذج تقديم'; }
    else if (j.channel === 'ocr_needed') { tagClass = 'tag-ocr'; tagLabel = 'صورة (تحتاج OCR)'; }

    const card = document.createElement('div');
    card.className = 'job-card';
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
        <strong style="color:#0f172a; font-size:13px;">${j.title}</strong>
        <span class="channel-tag ${tagClass}">${tagLabel}</span>
      </div>
      <div style="color:#065f46; font-weight:bold; font-size:11px; margin-bottom:4px;">${j.company} - ${j.city}</div>
      <div style="font-size:10px; color:#64748b; margin-bottom:8px;">العنوان المطلوب: "${j.subjectInstruction}"</div>
      <div style="display:flex; gap:6px;">
        ${j.email ? `<button onclick="openGmail('${j.email}', '${encodeURIComponent(j.subjectInstruction)}')" style="padding:4px 8px; font-size:10px; background:#065f46; color:white; border:none; border-radius:4px; cursor:pointer;">تجهيز البريد</button>` : ''}
        ${j.phone ? `<button onclick="openWA('${j.phone}')" style="padding:4px 8px; font-size:10px; background:#16a34a; color:white; border:none; border-radius:4px; cursor:pointer;">واتساب</button>` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

function openGmail(email, subj) {
  window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subj}`, '_blank');
}

function openWA(phone) {
  window.open(`https://wa.me/966${phone.slice(-9)}`, '_blank');
}

function downloadEMLDraft() {
  const emlContent = `To: hr@clinic-beauty.com
Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent('منسقة مواعيد - الرياض - محمد السكران')))}?=
X-Unsent: 1
Content-Type: text/html; charset=utf-8

<div style="direction:rtl; font-family:Arial;">
<h2>طلب توظيف: منسقة مواعيد - الرياض</h2>
<p>السلام عليكم ورحمة الله وبركاته،،</p>
<p>أتقدم إليكم بطلب التقديم على الوظيفة المعلنة عبر حساب @Wdhifaa.</p>
<hr>
<p><strong>الاسم:</strong> محمد السكران<br><strong>الجوال:</strong> 0539491361<br><strong>البريد:</strong> mohammed-alsakran@hotmail.com</p>
</div>`;

  const blob = new Blob([emlContent], { type: 'message/rfc822' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'qaddem_wdhifaa_draft.eml';
  a.click();
}
