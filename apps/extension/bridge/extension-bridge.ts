// Website-Extension Bridge v1.4 (Secure Bidirectional Messaging Engine)

export interface BridgeMessage<T = any> {
  source: 'QADDEM_WEB' | 'QADDEM_EXTENSION';
  type: 'PING' | 'PONG' | 'ANALYZE_JOB_PAGE' | 'SCRAPED_JOBS_RESULT' | 'FILL_FORM_REQUEST';
  payload?: T;
}

export function initExtensionBridge() {
  if (typeof window === 'undefined') return;

  window.addEventListener('message', (event) => {
    // Only accept messages from trusted origins or same-window web page
    if (event.source !== window) return;
    const msg = event.data as BridgeMessage;
    if (!msg || msg.source !== 'QADDEM_WEB') return;

    if (msg.type === 'PING') {
      window.postMessage({
        source: 'QADDEM_EXTENSION',
        type: 'PONG',
        payload: { version: '1.4.0', status: 'READY' }
      }, '*');
    }
  });
}
