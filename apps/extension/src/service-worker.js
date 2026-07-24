import {
  EXTENSION_VERSION,
  dedupeJobs,
  isAllowedBridgeSenderUrl,
  isBridgeRequest,
  permissionPatternForUrl,
  progressMessage,
  responseMessage,
  roundsForDepth,
  safeScanUrl,
} from './lib/contract.js';

const PENDING_SCAN_KEY = 'qaddemPendingScan';
const LAST_SCAN_KEY = 'qaddemLastScan';
const activeScans = new Map();

async function sendToTab(tabId, payload) {
  if (!Number.isInteger(tabId)) return;
  try {
    await chrome.tabs.sendMessage(tabId, payload);
  } catch {
    // The source tab can be closed while a scan is running.
  }
}

async function forwardProgress(sourceTabId, requestId, stage, message, extra = {}) {
  await sendToTab(sourceTabId, {
    internalType: 'QADDEM_FORWARD_PROGRESS',
    payload: progressMessage(requestId, stage, message, extra),
  });
}

async function forwardResponse(sourceTabId, payload) {
  await sendToTab(sourceTabId, {
    internalType: 'QADDEM_FORWARD_RESPONSE',
    payload,
  });
}

async function waitForTabReady(tabId, timeoutMs = 20_000) {
  const tab = await chrome.tabs.get(tabId);
  if (tab.status === 'complete') return;

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('TAB_LOAD_TIMEOUT'));
    }, timeoutMs);

    const onUpdated = (updatedTabId, changeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        cleanup();
        resolve();
      }
    };

    const onRemoved = (removedTabId) => {
      if (removedTabId === tabId) {
        cleanup();
        reject(new Error('TAB_CLOSED'));
      }
    };

    function cleanup() {
      clearTimeout(timeout);
      chrome.tabs.onUpdated.removeListener(onUpdated);
      chrome.tabs.onRemoved.removeListener(onRemoved);
    }

    chrome.tabs.onUpdated.addListener(onUpdated);
    chrome.tabs.onRemoved.addListener(onRemoved);
  });
}

async function injectAndRunScanner(tabId, requestId, rounds) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['scanner-content.js'],
  });

  return chrome.tabs.sendMessage(tabId, {
    internalType: 'QADDEM_SCANNER_RUN',
    requestId,
    rounds,
  });
}

async function scanTab({ requestId, targetUrl, targetTabId, sourceTabId, rounds }) {
  const state = {
    requestId,
    targetTabId,
    sourceTabId,
    cancelled: false,
  };
  activeScans.set(requestId, state);

  try {
    await forwardProgress(sourceTabId, requestId, 'loading', 'جارٍ انتظار اكتمال تحميل الصفحة.');
    await waitForTabReady(targetTabId);
    if (state.cancelled) {
      return responseMessage(requestId, 'cancelled');
    }

    const loadedTab = await chrome.tabs.get(targetTabId);
    const loadedUrl = safeScanUrl(loadedTab.url ?? targetUrl.toString());
    if (!loadedUrl) throw new Error('UNSAFE_REDIRECT');

    const loadedPermission = permissionPatternForUrl(loadedUrl);
    const permitted = await chrome.permissions.contains({
      origins: [loadedPermission],
    });
    if (!permitted) {
      throw new Error('REDIRECT_PERMISSION_REQUIRED');
    }

    await forwardProgress(sourceTabId, requestId, 'scanning', 'بدأ فحص البطاقات الظاهرة والتمرير المحدود.', {
      currentRound: 0,
      totalRounds: rounds,
    });

    const rawResult = await injectAndRunScanner(
      targetTabId,
      requestId,
      rounds,
    );

    if (rawResult?.cancelled || state.cancelled) {
      return responseMessage(requestId, 'cancelled');
    }
    if (rawResult?.error) throw new Error('SCANNER_FAILED');

    await forwardProgress(sourceTabId, requestId, 'deduplicating', 'جارٍ إزالة النتائج المكررة.');
    const jobs = dedupeJobs(rawResult?.jobs ?? []).slice(0, 100);
    const result = {
      scannedUrl: loadedUrl.toString(),
      jobs,
      loginRequired: Boolean(rawResult?.loginRequired),
      roundsCompleted: Number(rawResult?.roundsCompleted ?? 0),
      partial: Boolean(rawResult?.partial),
      targetTabId,
    };

    await chrome.storage.local.set({
      [LAST_SCAN_KEY]: {
        ...result,
        completedAt: new Date().toISOString(),
      },
    });
    await forwardProgress(sourceTabId, requestId, 'complete', `اكتمل الفحص وعُثر على ${jobs.length} نتيجة.`);

    return responseMessage(requestId, 'ok', { data: result });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    const errorMessage =
      reason === 'TAB_LOAD_TIMEOUT'
        ? 'انتهت مهلة تحميل الصفحة.'
        : reason === 'REDIRECT_PERMISSION_REQUIRED'
          ? 'انتقلت الصفحة إلى نطاق آخر يحتاج إذنًا منفصلًا.'
          : reason === 'UNSAFE_REDIRECT'
            ? 'انتقلت الصفحة إلى عنوان غير مسموح بفحصه.'
            : 'تعذر فحص الصفحة. تأكد من تسجيل الدخول ومن صلاحية الرابط.';

    await forwardProgress(sourceTabId, requestId, 'error', errorMessage);
    return responseMessage(requestId, 'error', { error: errorMessage });
  } finally {
    activeScans.delete(requestId);
  }
}

async function openAndScan(request, sourceTabId) {
  const targetUrl = safeScanUrl(request.payload.url);
  if (!targetUrl) {
    return responseMessage(request.requestId, 'error', {
      error: 'الرابط غير صالح أو يشير إلى شبكة داخلية غير مسموحة.',
    });
  }

  const permissionOrigin = permissionPatternForUrl(targetUrl);
  const hasPermission = await chrome.permissions.contains({
    origins: [permissionOrigin],
  });

  if (!hasPermission) {
    await chrome.storage.local.set({
      [PENDING_SCAN_KEY]: {
        request,
        sourceTabId,
        permissionOrigin,
        createdAt: Date.now(),
      },
    });
    await forwardProgress(
      sourceTabId,
      request.requestId,
      'permission_required',
      'افتح أيقونة إضافة قدّم لمنح إذن النطاق والمتابعة.',
    );
    return responseMessage(request.requestId, 'permission_required', {
      permissionOrigin,
    });
  }

  await forwardProgress(sourceTabId, request.requestId, 'opening', 'جارٍ فتح رابط الوظيفة في تبويب جديد.');
  const tab = await chrome.tabs.create({
    url: targetUrl.toString(),
    active: true,
  });
  if (!Number.isInteger(tab.id)) {
    return responseMessage(request.requestId, 'error', {
      error: 'تعذر إنشاء تبويب الفحص.',
    });
  }

  return scanTab({
    requestId: request.requestId,
    targetUrl,
    targetTabId: tab.id,
    sourceTabId,
    rounds: roundsForDepth(request.payload.depth),
  });
}

async function cancelScan(request) {
  const targetRequestId = request.payload.targetRequestId;
  const scan = activeScans.get(targetRequestId);
  if (scan) {
    scan.cancelled = true;
    await sendToTab(scan.targetTabId, {
      internalType: 'QADDEM_SCANNER_CANCEL',
      requestId: targetRequestId,
    });
    await forwardProgress(scan.sourceTabId, targetRequestId, 'cancelled', 'تم إلغاء الفحص.');
  }
  return responseMessage(request.requestId, 'cancelled');
}

async function handleBridgeRequest(request, sender) {
  if (!sender.tab?.id || !isAllowedBridgeSenderUrl(sender.tab.url ?? '')) {
    return responseMessage(request.requestId, 'error', {
      error: 'مصدر الرسالة غير مصرح له.',
    });
  }

  if (request.command === 'PING') {
    return responseMessage(request.requestId, 'ok', {
      data: { connected: true },
    });
  }
  if (request.command === 'CANCEL_SCAN') return cancelScan(request);
  return openAndScan(request, sender.tab.id);
}

async function popupState() {
  const stored = await chrome.storage.local.get([PENDING_SCAN_KEY, LAST_SCAN_KEY]);
  return {
    extensionVersion: EXTENSION_VERSION,
    pending: stored[PENDING_SCAN_KEY] ?? null,
    lastScan: stored[LAST_SCAN_KEY] ?? null,
  };
}

async function resumePendingScan() {
  const stored = await chrome.storage.local.get(PENDING_SCAN_KEY);
  const pending = stored[PENDING_SCAN_KEY];
  if (!pending) return { ok: false, error: 'لا يوجد فحص معلق.' };

  const hasPermission = await chrome.permissions.contains({
    origins: [pending.permissionOrigin],
  });
  if (!hasPermission) return { ok: false, error: 'لم يتم منح الإذن.' };

  await chrome.storage.local.remove(PENDING_SCAN_KEY);
  const response = await openAndScan(pending.request, pending.sourceTabId);
  await forwardResponse(pending.sourceTabId, response);
  return { ok: response.status === 'ok', response };
}

async function scanCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!Number.isInteger(tab?.id) || !tab.url) {
    return { ok: false, error: 'لا توجد صفحة نشطة قابلة للفحص.' };
  }
  const targetUrl = safeScanUrl(tab.url);
  if (!targetUrl) return { ok: false, error: 'هذه الصفحة غير قابلة للفحص.' };

  const requestId = `popup_${crypto.randomUUID().replace(/-/g, '')}`;
  const response = await scanTab({
    requestId,
    targetUrl,
    targetTabId: tab.id,
    sourceTabId: undefined,
    rounds: 7,
  });
  return { ok: response.status === 'ok', response };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (isBridgeRequest(message)) {
    handleBridgeRequest(message, sender).then(sendResponse).catch(() =>
      sendResponse(
        responseMessage(message.requestId, 'error', {
          error: 'تعذر تنفيذ طلب الإضافة.',
        }),
      ),
    );
    return true;
  }

  if (message?.internalType === 'QADDEM_SCANNER_PROGRESS') {
    const scan = activeScans.get(String(message.requestId));
    if (scan) {
      forwardProgress(scan.sourceTabId, scan.requestId, 'scanning', 'جارٍ تحميل وفحص المزيد من البطاقات.', {
        currentRound: Number(message.currentRound),
        totalRounds: Number(message.totalRounds),
      });
    }
    sendResponse({ ok: true });
    return false;
  }

  if (message?.internalType === 'QADDEM_POPUP_STATE') {
    popupState().then(sendResponse);
    return true;
  }
  if (message?.internalType === 'QADDEM_POPUP_RESUME_PENDING') {
    resumePendingScan().then(sendResponse);
    return true;
  }
  if (message?.internalType === 'QADDEM_POPUP_SCAN_CURRENT') {
    scanCurrentTab().then(sendResponse);
    return true;
  }

  return false;
});
