import {
  EXTENSION_VERSION,
  PRIMARY_WEB_ORIGIN,
  permissionPatternForUrl,
} from './lib/contract.js';
import { downloadJobsExcel } from './lib/excel-export.js';

const versionElement = document.querySelector('#version');
const pendingCard = document.querySelector('#pending-card');
const pendingOrigin = document.querySelector('#pending-origin');
const grantButton = document.querySelector('#grant-button');
const scanCurrentButton = document.querySelector('#scan-current-button');
const lastScanCard = document.querySelector('#last-scan-card');
const lastScanSummary = document.querySelector('#last-scan-summary');
const scanMetrics = document.querySelector('#scan-metrics');
const resultsList = document.querySelector('#results-list');
const ocrButton = document.querySelector('#ocr-button');
const openSiteButton = document.querySelector('#open-site-button');
const exportButton = document.querySelector('#export-button');
const clearButton = document.querySelector('#clear-button');
const statusElement = document.querySelector('#status');

versionElement.textContent = `الإضافة متصلة v${EXTENSION_VERSION}`;
let currentPending = null;
let currentLastScan = null;

function setStatus(message, isError = false) {
  statusElement.textContent = message;
  statusElement.classList.toggle('error', isError);
}

function displayValue(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function metric(value, label) {
  const item = document.createElement('div');
  item.className = 'metric';
  const strong = document.createElement('strong');
  strong.textContent = String(value);
  const span = document.createElement('span');
  span.textContent = label;
  item.append(strong, span);
  return item;
}

function renderResults(lastScan) {
  resultsList.replaceChildren();
  scanMetrics.replaceChildren();

  const jobs = lastScan?.jobs ?? [];
  const imageCount = jobs.reduce((total, job) => total + (job.imageUrls?.length ?? 0), 0);
  const ocrCount = jobs.filter((job) => job.ocrStatus === 'complete').length;
  scanMetrics.append(
    metric(jobs.length, 'نتيجة'),
    metric(imageCount, 'صورة'),
    metric(ocrCount, 'OCR مكتمل'),
  );

  for (const [index, job] of jobs.slice(0, 20).entries()) {
    const item = document.createElement('article');
    item.className = 'result-item';
    const title = document.createElement('h3');
    title.textContent = `${index + 1}. ${displayValue(job.title, 'مسمى يحتاج مراجعة')}`;
    const subtitle = document.createElement('p');
    subtitle.textContent = `${displayValue(job.company, 'الشركة غير مستخرجة')} · ${displayValue(job.location, 'الموقع غير مستخرج')}`;
    const meta = document.createElement('div');
    meta.className = 'result-meta';

    const platform = document.createElement('span');
    platform.textContent = job.sourcePlatform ?? 'unknown';
    meta.append(platform);

    if (job.imageUrls?.length) {
      const images = document.createElement('span');
      images.textContent = `${job.imageUrls.length} صورة`;
      meta.append(images);
    }
    if (job.ocrStatus === 'complete') {
      const ocr = document.createElement('span');
      ocr.textContent = 'OCR مكتمل';
      meta.append(ocr);
    } else if (job.imageUrls?.length) {
      const ocr = document.createElement('span');
      ocr.textContent = 'يحتاج OCR';
      meta.append(ocr);
    }
    if (job.applyUrl || job.forms?.length) {
      const apply = document.createElement('span');
      apply.textContent = 'رابط تقديم';
      meta.append(apply);
    }

    item.append(title, subtitle, meta);
    resultsList.append(item);
  }

  if (jobs.length > 20) {
    const remaining = document.createElement('p');
    remaining.textContent = `توجد ${jobs.length - 20} نتيجة إضافية ستظهر كاملة عند الإرسال إلى الموقع أو التصدير.`;
    resultsList.append(remaining);
  }

  ocrButton.disabled = imageCount === 0;
  exportButton.disabled = jobs.length === 0;
  openSiteButton.disabled = jobs.length === 0;
}

async function refreshState() {
  const state = await chrome.runtime.sendMessage({
    internalType: 'QADDEM_POPUP_STATE',
  });
  currentPending = state?.pending ?? null;
  currentLastScan = state?.lastScan ?? null;

  if (currentPending) {
    pendingCard.classList.remove('hidden');
    pendingOrigin.textContent = currentPending.permissionOrigin;
  } else {
    pendingCard.classList.add('hidden');
  }

  if (currentLastScan) {
    lastScanCard.classList.remove('hidden');
    const count = currentLastScan.jobs?.length ?? 0;
    lastScanSummary.textContent = `تم العثور على ${count} نتيجة. راجعها قبل النقل أو التصدير.`;
    renderResults(currentLastScan);
  } else {
    lastScanCard.classList.add('hidden');
    resultsList.replaceChildren();
    scanMetrics.replaceChildren();
  }
}

grantButton.addEventListener('click', async () => {
  if (!currentPending?.permissionOrigin) return;
  grantButton.disabled = true;
  setStatus('جارٍ طلب الإذن…');

  try {
    const granted = await chrome.permissions.request({
      origins: [currentPending.permissionOrigin],
    });
    if (!granted) {
      setStatus('لم يتم منح الإذن.', true);
      return;
    }

    setStatus('تم منح الإذن. بدأ الفحص في تبويب جديد.');
    await chrome.runtime.sendMessage({
      internalType: 'QADDEM_POPUP_RESUME_PENDING',
    });
    await refreshState();
  } catch {
    setStatus('تعذر إكمال طلب الإذن.', true);
  } finally {
    grantButton.disabled = false;
  }
});

scanCurrentButton.addEventListener('click', async () => {
  scanCurrentButton.disabled = true;
  setStatus('جارٍ فحص الصفحة الحالية…');

  try {
    const result = await chrome.runtime.sendMessage({
      internalType: 'QADDEM_POPUP_SCAN_CURRENT',
    });
    if (!result?.ok) {
      setStatus(result?.error ?? 'تعذر فحص الصفحة الحالية.', true);
      return;
    }

    const count = result.response?.data?.jobs?.length ?? 0;
    setStatus(`اكتمل الفحص وعُثر على ${count} نتيجة. راجع القائمة أدناه.`);
    await refreshState();
  } catch {
    setStatus('تعذر فحص الصفحة الحالية.', true);
  } finally {
    scanCurrentButton.disabled = false;
  }
});

ocrButton.addEventListener('click', async () => {
  if (!currentLastScan?.jobs?.length) return;
  ocrButton.disabled = true;
  setStatus('جارٍ تجهيز صور الإعلانات للتحليل…');

  try {
    const apiPermission = permissionPatternForUrl(new URL(PRIMARY_WEB_ORIGIN));
    const granted = await chrome.permissions.request({ origins: [apiPermission] });
    if (!granted) {
      setStatus('لم يتم منح إذن الاتصال بخادم قدّم لتحليل الصور.', true);
      return;
    }

    setStatus('جارٍ تحليل الصور العامة عبر Gemini OCR…');
    const result = await chrome.runtime.sendMessage({
      internalType: 'QADDEM_POPUP_OCR_LAST',
    });
    if (!result?.ok) {
      setStatus(result?.error ?? 'تعذر تحليل الصور.', true);
      return;
    }

    setStatus(`اكتمل تحليل ${result.processed ?? 0} نتيجة مصورة، وتعذر ${result.failed ?? 0}.`);
    await refreshState();
  } catch {
    setStatus('تعذر تشغيل تحليل الصور.', true);
  } finally {
    ocrButton.disabled = false;
  }
});

openSiteButton.addEventListener('click', async () => {
  if (!currentLastScan?.jobs?.length) return;
  const destination = `${PRIMARY_WEB_ORIGIN}/devices?import=last`;
  await chrome.tabs.create({ url: destination, active: true });
  setStatus('تم فتح موقع قدّم لاستيراد آخر فحص.');
});

exportButton.addEventListener('click', () => {
  if (!currentLastScan?.jobs?.length) return;
  const date = new Date().toISOString().slice(0, 10);
  downloadJobsExcel(currentLastScan.jobs, `qaddem-jobs-${date}.xls`);
  setStatus('تم إنشاء ملف Excel بالنتائج الحالية.');
});

clearButton.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ internalType: 'QADDEM_POPUP_CLEAR_LAST' });
  currentLastScan = null;
  setStatus('تم حذف نتائج الفحص المحفوظة من الإضافة.');
  await refreshState();
});

refreshState().catch(() => setStatus('تعذر قراءة حالة الإضافة.', true));
