export const CONTRACT_DATA = Object.freeze({
  protocol: 'qaddem.bridge.v1',
  extensionVersion: '1.6.0',
  primaryWebOrigin: 'https://qaddemweb-production.up.railway.app',
  messageTypes: Object.freeze({
    ready: 'QADDEM_BRIDGE_READY',
    request: 'QADDEM_BRIDGE_REQUEST',
    response: 'QADDEM_BRIDGE_RESPONSE',
    progress: 'QADDEM_BRIDGE_PROGRESS',
  }),
  allowedWebOrigins: Object.freeze([
    'https://haderksa.org',
    'https://www.haderksa.org',
    'https://qaddemweb-production.up.railway.app',
    'http://localhost:3000',
  ]),
  scanRounds: Object.freeze({
    quick: 6,
    balanced: 12,
    deep: 24,
  }),
  limits: Object.freeze({
    maxJobsPerScan: 250,
    maxImagesPerJob: 4,
    maxOcrJobsPerRequest: 12,
  }),
});
