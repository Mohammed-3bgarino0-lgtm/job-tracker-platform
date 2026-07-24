(async function installQaddemBridge() {
  const contract = await import(chrome.runtime.getURL('lib/contract.js'));
  const {
    ALLOWED_WEB_ORIGINS,
    BRIDGE_PROTOCOL,
    EXTENSION_VERSION,
    MESSAGE_TYPES,
    isBridgeRequest,
  } = contract;
  const pageOrigin = window.location.origin;

  if (!ALLOWED_WEB_ORIGINS.includes(pageOrigin)) return;
  if (globalThis.__QADDEM_BRIDGE_INSTALLED__) return;
  globalThis.__QADDEM_BRIDGE_INSTALLED__ = true;

  function postToPage(message) {
    window.postMessage(message, pageOrigin);
  }

  postToPage({
    messageType: MESSAGE_TYPES.ready,
    protocol: BRIDGE_PROTOCOL,
    extensionVersion: EXTENSION_VERSION,
  });

  window.addEventListener('message', async (event) => {
    if (event.source !== window || event.origin !== pageOrigin) return;
    if (!isBridgeRequest(event.data)) return;

    try {
      const response = await chrome.runtime.sendMessage(event.data);
      if (response) postToPage(response);
    } catch {
      postToPage({
        messageType: MESSAGE_TYPES.response,
        protocol: BRIDGE_PROTOCOL,
        requestId: event.data.requestId,
        status: 'error',
        extensionVersion: EXTENSION_VERSION,
        error: 'تعذر الاتصال بخدمة إضافة قدّم.',
      });
    }
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (
      message?.internalType === 'QADDEM_FORWARD_PROGRESS' ||
      message?.internalType === 'QADDEM_FORWARD_RESPONSE'
    ) {
      postToPage(message.payload);
    }
  });
})();
