import {
  BRIDGE_LIMITS,
  EXTENSION_VERSION,
  PRIMARY_WEB_ORIGIN,
  dedupeJobs,
  permissionPatternForUrl,
  safeScanUrl,
} from './lib/contract.js';
import { downloadJobsExcel } from './lib/excel-export.js';

const LAST_SCAN_KEY = 'qaddemLastScan';
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
  strong.textContent = String(value ?? 0);
  const span = document.createElement('span');
  span.textContent = label;
  item.append(strong, span);
  return item;
}

function reviewLabel(status) {
  return (
    {
      confirmed: 'واضحة',
      potential: 'محتملة',
      needs_ocr: 'تحتاج OCR',
      incomplete: 'غير مكتملة',
    }[status] ?? 'تحتاج مراجعة'
  );
}

function reviewClass(status) {
  return (
    {
      confirmed: 'success',
      potential: 'warning',
      needs_ocr: 'warning',
      incomplete: '',
    }[status] ?? ''
  );
}

function calculateCounts(lastScan) {
  const jobs = lastScan?.jobs ?? [];
  return {
    sourceItems: lastScan?.sourceItemsScanned ?? new Set(jobs.map((job) => job.sourceItemId ?? job.sourceUrl)).size,
    jobs: jobs.length,
    confirmed:
      lastScan?.confirmedCount ??
      jobs.filter((job) => job.reviewStatus === 'confirmed').length,
    potential:
      lastScan?.potentialCount ??
      jobs.filter((job) => job.reviewStatus === 'potential').length,
    needsOcr:
      lastScan?.needsOcrCount ??
      jobs.filter((job) => job.reviewStatus === 'needs_ocr').length,
    incomplete:
      lastScan?.incompleteCount ??
      jobs.filter((job) => job.reviewStatus === 'incomplete').length,
    images: jobs.reduce((total, job) => total + (job.imageUrls?.length ?? 0), 0),
    ocrComplete: jobs.filter((job) => job.ocrStatus === 'complete').length,
  };
}

function renderResults(lastScan) {
  resultsList.replaceChildren();
  scanMetrics.replaceChildren();

  const jobs = lastScan?.jobs ?? [];
  const counts = calculateCounts(lastScan);
  scanMetrics.append(
    metric(counts.sourceItems, 'منشور/بطاقة'),
    metric(counts.jobs, 'نتيجة'),
    metric(counts.confirmed, 'واضحة'),
    metric(counts.potential, 'محتملة'),
    metric(counts.needsOcr, 'تحتاج OCR'),
    metric(counts.incomplete, 'غير مكتملة'),
  );

  for (const [index, job] of jobs.entries()) {
    const item = document.createElement('article');
    item.className = 'result-item';
    const title = document.createElement('h3');
    title.textContent = `${index + 1}. ${displayValue(job.title, 'مسمى يحتاج مراجعة')}`;
    const subtitle = document.createElement('p');
    subtitle.textContent = `${displayValue(job.company, 'الشركة غير مستخرجة')} · ${displayValue(job.location, 'الموقع غير مستخرج')}`;
    const meta = document.createElement('div');
    meta.className = 'result-meta';

    const review = document.createElement('span');
    review.className = `badge ${reviewClass(job.reviewStatus)}`;
    const confidence = Math.round(Number(job.confidence ?? 0) * 100);
    review.textContent = `${reviewLabel(job.reviewStatus)}${confidence ? ` · ${confidence}%` : ''}`;
    meta.append(review);

    const platform = document.createElement('span');
    platform.textContent = job.sourcePlatform ?? 'unknown';
    meta.append(platform);

    if (job.authorHandle || job.authorName) {
      const author = document.createElement('span');
      author.textContent = job.authorHandle ?? job.authorName;
      meta.append(author);
    }

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
    if (job.applyUrl || job.forms?.length || job.emails?.length || job.phones?.length) {
      const apply = document.createElement('span');
      apply.textContent = 'طريقة تقديم مكتشفة';
      meta.append(apply);
    }

    item.append(title, subtitle, meta);
    resultsList.append(item);
  }

  ocrButton.disabled = counts.images === 0;
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
    const counts = calculateCounts(currentLastScan);
    const completeness =
      currentLastScan.partial || currentLastScan.truncated
        ? 'الفحص جزئي؛ أعد الفحص أو استخدم العمق العميق لإظهار مزيد من النتائج.'
        : 'تمت مراجعة جميع البطاقات التي حمّلتها الصفحة أثناء الفحص.';
    lastScanSummary.textContent = `تمت قراءة ${counts.sourceItems} بطاقة وإنتاج ${counts.jobs} نتيجة. ${completeness}`;
    renderResults(currentLastScan);
  } else {
    lastScanCard.classList.add('hidden');
    resultsList.replaceChildren();
    scanMetrics.replaceChildren();
  }
}

async function scanCurrentPageWithActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!Number.isInteger(tab?.id) || !tab.url) {
    throw new Error('NO_ACTIVE_TAB');
  }

  const targetUrl = safeScanUrl(tab.url);
  if (!targetUrl) {
    throw new Error('UNSUPPORTED_PAGE');
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['scanner-content.js'],
  });

  const requestId = `popup_${crypto.randomUUID().replace(/-/g, '')}`;
  const rawResult = await chrome.tabs.sendMessage(tab.id, {
    internalType: 'QADDEM_SCANNER_RUN',
    requestId,
    rounds: 24,
  });

  if (rawResult?.cancelled) {
    throw new Error('SCAN_CANCELLED');
  }
  if (rawResult?.error) {
    throw new Error('SCANNER_FAILED');
  }

  const loadedTab = await chrome.tabs.get(tab.id);
  const loadedUrl = safeScanUrl(loadedTab.url ?? targetUrl.toString());
  if (!loadedUrl) {
    throw new Error('UNSAFE_REDIRECT');
  }

  const jobs = dedupeJobs(rawResult?.jobs ?? []).slice(0, BRIDGE_LIMITS.maxJobsPerScan);
  const lastScan = {
    scannedUrl: loadedUrl.toString(),
    jobs,
    loginRequired: Boolean(rawResult?.loginRequired),
    roundsCompleted: Number(rawResult?.roundsCompleted ?? 0),
    partial: Boolean(rawResult?.partial),
    truncated: Boolean(rawResult?.truncated) || (rawResult?.jobs?.length ?? 0) > jobs.length,
    stopReason: rawResult?.stopReason ?? null,
    sourceItemsScanned: Number(rawResult?.sourceItemsScanned ?? 0),
    confirmedCount: jobs.filter((job) => job.reviewStatus === 'confirmed').length,
    potentialCount: jobs.filter((job) => job.reviewStatus === 'potential').length,
    needsOcrCount: jobs.filter((job) => job.reviewStatus === 'needs_ocr').length,
    incompleteCount: jobs.filter((job) => job.reviewStatus === 'incomplete').length,
    targetTabId: tab.id,
    completedAt: new Date().toISOString(),
  };

  await chrome.storage.local.set({ [LAST_SCAN_KEY]: lastScan });
  return lastScan;
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
  setStatus('جارٍ بدء فحص شامل وتجميع جميع المنشورات المحملة أثناء التمرير…');

  try {
    const lastScan = await scanCurrentPageWithActiveTab();
    const counts = calculateCounts(lastScan);
    const warning =
      lastScan.partial || lastScan.truncated
        ? ' بقيت نتائج محتملة خارج حد الفحص؛ أعد تشغيله لإكمال المزيد.'
        : '';
    setStatus(
      `اكتمل الفحص: ${counts.sourceItems} بطاقة و${counts.jobs} نتيجة، منها ${counts.confirmed} واضحة.${warning}`,
    );
    await refreshState();
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    const message =
      reason === 'NO_ACTIVE_TAB'
        ? 'لا توجد صفحة نشطة قابلة للفحص.'
        : reason === 'UNSUPPORTED_PAGE'
          ? 'هذه الصفحة غير قابلة للفحص. افتح صفحة ويب عامة تبدأ بـ http أو https.'
          : reason === 'UNSAFE_REDIRECT'
            ? 'تغير عنوان الصفحة إلى رابط غير مسموح بفحصه.'
            : reason === 'SCAN_CANCELLED'
              ? 'تم إلغاء الفحص.'
              : 'تعذر الوصول إلى محتوى الصفحة. أعد تحميل الصفحة ثم افتح الإضافة واضغط الفحص مرة أخرى.';
    setStatus(message, true);
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
  setStatus('تم فتح موقع قدّم لاستيراد جميع نتائج آخر فحص.');
});

exportButton.addEventListener('click', () => {
  if (!currentLastScan?.jobs?.length) return;
  const date = new Date().toISOString().slice(0, 10);
  downloadJobsExcel(currentLastScan.jobs, `qaddem-jobs-${date}.xls`);
  setStatus(`تم إنشاء ملف Excel ويحتوي على جميع النتائج الحالية وعددها ${currentLastScan.jobs.length}.`);
});

clearButton.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ internalType: 'QADDEM_POPUP_CLEAR_LAST' });
  currentLastScan = null;
  setStatus('تم حذف نتائج الفحص المحفوظة من الإضافة.');
  await refreshState();
});

refreshState().catch(() => setStatus('تعذر قراءة حالة الإضافة.', true));
