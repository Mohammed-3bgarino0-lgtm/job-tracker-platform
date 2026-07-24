// Universal Job Source Analyzer Sidepanel Script v1.2

let storedUniversalJobs = [];
let activeChannelFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  loadStoredJobs();
});

function loadStoredJobs() {
  chrome.storage.local.get({ savedJobs: [] }, (res) => {
    storedUniversalJobs = res.savedJobs || [];
    document.getElementById('stored-count').innerText = storedUniversalJobs.length;
    renderUniversalJobsList();
  });
}

function analyzeUniversalUrl() {
  const url = document.getElementById('universal-url-input').value.trim();
  if (!url) { alert('يرجى إدخال الرابط المراد تحليله أولاً!'); return; }
  window.open(url, '_blank');
}

function scrapeCurrentActiveTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        if (window.UniversalAdapter) {
          return window.UniversalAdapter.parseVisiblePageJobs();
        }
        return [];
      }
    }, (results) => {
      if (results && results[0] && results[0].result && results[0].result.length > 0) {
        saveNewUniversalJobs(results[0].result);
      } else {
        alert('لم يتم اكتشاف بيانات وظائف معلنة بالصفحة الحالية.');
      }
    });
  });
}

function saveNewUniversalJobs(newJobs) {
  chrome.storage.local.get({ savedJobs: [] }, (res) => {
    let list = res.savedJobs || [];
    newJobs.forEach(nj => {
      if (!list.some(item => item.sourceUrl === nj.sourceUrl && item.title === nj.title)) {
        list.unshift(nj);
      }
    });
    if (list.length > 300) list = list.slice(0, 300);
    chrome.storage.local.set({ savedJobs: list }, () => {
      storedUniversalJobs = list;
      document.getElementById('stored-count').innerText = storedUniversalJobs.length;
      renderUniversalJobsList();
    });
  });
}

function setChannelFilter(filter) {
  activeChannelFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('f-' + filter)?.classList.add('active');
  renderUniversalJobsList();
}

function renderUniversalJobsList() {
  const container = document.getElementById('universal-jobs-list');
  container.innerHTML = '';

  let filtered = storedUniversalJobs;
  if (activeChannelFilter !== 'all') {
    filtered = storedUniversalJobs.filter(j => j.channel === activeChannelFilter);
  }

  if (filtered.length === 0) {
    container.innerHTML = '<div style="font-size:11px; color:#64748b; text-align:center; padding:10px;">لا توجد إعلانات محفوظة مطابقة للفلتر المباشر.</div>';
    return;
  }

  filtered.forEach((j) => {
    let tagClass = 'tag-link';
    let tagLabel = 'رابط خارجي';
    if (j.channel === 'email') { tagClass = 'tag-email'; tagLabel = 'إيميل'; }
    else if (j.channel === 'whatsapp') { tagClass = 'tag-whatsapp'; tagLabel = 'واتساب'; }
    else if (j.channel === 'form') { tagClass = 'tag-form'; tagLabel = 'نموذج'; }

    const card = document.createElement('div');
    card.className = 'job-card';
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
        <strong style="color:#0f172a; font-size:12px;">${j.title}</strong>
        <span class="channel-tag ${tagClass}">${tagLabel}</span>
      </div>
      <div style="font-size:11px; color:#065f46; font-weight:bold; margin-bottom:4px;">${j.company} - ${j.city}</div>
      <div style="font-size:10px; color:#64748b; margin-bottom:6px; word-break:break-all;">المصدر: <a href="${j.sourceUrl}" target="_blank" style="color:#0284c7;">${j.sourceUrl.slice(0, 45)}...</a></div>
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        ${j.primaryEmail ? `<button onclick="openGmailCompose('${j.primaryEmail}', '${encodeURIComponent(j.subjectInstruction)}')" style="padding:4px 8px; font-size:10px; background:#065f46; color:white; border:none; border-radius:4px; cursor:pointer;">تجهيز البريد</button>` : ''}
        ${j.primaryPhone ? `<button onclick="openWhatsApp('${j.primaryPhone}')" style="padding:4px 8px; font-size:10px; background:#16a34a; color:white; border:none; border-radius:4px; cursor:pointer;">واتساب</button>` : ''}
        ${j.primaryForm ? `<a href="${j.primaryForm}" target="_blank" style="padding:4px 8px; font-size:10px; background:#2563eb; color:white; text-decoration:none; border-radius:4px;">فتح النموذج</a>` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

function openGmailCompose(email, subj) {
  window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subj}`, '_blank');
}

function openWhatsApp(phone) {
  window.open(`https://wa.me/966${phone.slice(-9)}`, '_blank');
}

function exportStoredJobsJSON() {
  const blob = new Blob([JSON.stringify(storedUniversalJobs, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'qaddem_universal_jobs_v1.2.json';
  a.click();
}
