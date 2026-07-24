import { EXTENSION_VERSION } from './lib/contract.js';

const versionElement = document.querySelector('#version');
const pendingCard = document.querySelector('#pending-card');
const pendingOrigin = document.querySelector('#pending-origin');
const grantButton = document.querySelector('#grant-button');
const scanCurrentButton = document.querySelector('#scan-current-button');
const lastScanCard = document.querySelector('#last-scan-card');
const lastScanSummary = document.querySelector('#last-scan-summary');
const statusElement = document.querySelector('#status');

versionElement.textContent = `الإضافة متصلة v${EXTENSION_VERSION}`;
let currentPending = null;

function setStatus(message, isError = false) {
  statusElement.textContent = message;
  statusElement.classList.toggle('error', isError);
}

async function refreshState() {
  const state = await chrome.runtime.sendMessage({
    internalType: 'QADDEM_POPUP_STATE',
  });
  currentPending = state?.pending ?? null;

  if (currentPending) {
    pendingCard.classList.remove('hidden');
    pendingOrigin.textContent = currentPending.permissionOrigin;
  } else {
    pendingCard.classList.add('hidden');
  }

  if (state?.lastScan) {
    lastScanCard.classList.remove('hidden');
    lastScanSummary.textContent = `تم العثور على ${state.lastScan.jobs?.length ?? 0} نتيجة في آخر فحص.`;
  } else {
    lastScanCard.classList.add('hidden');
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
    setStatus(`اكتمل الفحص وعُثر على ${count} نتيجة.`);
    await refreshState();
  } catch {
    setStatus('تعذر فحص الصفحة الحالية.', true);
  } finally {
    scanCurrentButton.disabled = false;
  }
});

refreshState().catch(() => setStatus('تعذر قراءة حالة الإضافة.', true));
