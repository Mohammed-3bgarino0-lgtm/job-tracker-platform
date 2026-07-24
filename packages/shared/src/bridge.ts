import contract from './bridge-contract.json';

export const QADDEM_BRIDGE_PROTOCOL = contract.protocol;
export const QADDEM_EXTENSION_VERSION = contract.extensionVersion;
export const QADDEM_BRIDGE_MESSAGE_TYPES = contract.messageTypes;
export const QADDEM_ALLOWED_WEB_ORIGINS = contract.allowedWebOrigins;

export type ScanDepth = keyof typeof contract.scanRounds;
export type BridgeCommand = 'PING' | 'SCAN_URL' | 'CANCEL_SCAN';
export type BridgeResponseStatus =
  | 'ok'
  | 'error'
  | 'permission_required'
  | 'cancelled';
export type BridgeProgressStage =
  | 'opening'
  | 'loading'
  | 'scanning'
  | 'deduplicating'
  | 'complete'
  | 'permission_required'
  | 'cancelled'
  | 'error';

export interface JobScanRecord {
  sourceUrl: string;
  sourcePlatform: 'x' | 'linkedin' | 'ats' | 'company' | 'unknown';
  title: string | null;
  company: string | null;
  location: string | null;
  description: string | null;
  applyUrl: string | null;
  emails: string[];
  phones: string[];
  forms: string[];
  evidence: string[];
  detectedAt: string;
}

export interface BridgeScanResult {
  scannedUrl: string;
  jobs: JobScanRecord[];
  loginRequired: boolean;
  roundsCompleted: number;
  partial: boolean;
  targetTabId?: number;
}

export interface BridgeReadyMessage {
  messageType: typeof QADDEM_BRIDGE_MESSAGE_TYPES.ready;
  protocol: typeof QADDEM_BRIDGE_PROTOCOL;
  extensionVersion: string;
}

export type BridgeRequestMessage =
  | {
      messageType: typeof QADDEM_BRIDGE_MESSAGE_TYPES.request;
      protocol: typeof QADDEM_BRIDGE_PROTOCOL;
      requestId: string;
      command: 'PING';
      payload?: undefined;
    }
  | {
      messageType: typeof QADDEM_BRIDGE_MESSAGE_TYPES.request;
      protocol: typeof QADDEM_BRIDGE_PROTOCOL;
      requestId: string;
      command: 'SCAN_URL';
      payload: {
        url: string;
        depth: ScanDepth;
      };
    }
  | {
      messageType: typeof QADDEM_BRIDGE_MESSAGE_TYPES.request;
      protocol: typeof QADDEM_BRIDGE_PROTOCOL;
      requestId: string;
      command: 'CANCEL_SCAN';
      payload: {
        targetRequestId: string;
      };
    };

export interface BridgeResponseMessage {
  messageType: typeof QADDEM_BRIDGE_MESSAGE_TYPES.response;
  protocol: typeof QADDEM_BRIDGE_PROTOCOL;
  requestId: string;
  status: BridgeResponseStatus;
  extensionVersion: string;
  data?: BridgeScanResult | { connected: true };
  error?: string;
  permissionOrigin?: string;
}

export interface BridgeProgressMessage {
  messageType: typeof QADDEM_BRIDGE_MESSAGE_TYPES.progress;
  protocol: typeof QADDEM_BRIDGE_PROTOCOL;
  requestId: string;
  stage: BridgeProgressStage;
  message: string;
  currentRound?: number;
  totalRounds?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isRequestId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{8,128}$/.test(value);
}

export function scanRoundsForDepth(depth: ScanDepth): number {
  return contract.scanRounds[depth];
}

export function isAllowedWebsiteOrigin(origin: string): boolean {
  return QADDEM_ALLOWED_WEB_ORIGINS.includes(origin);
}

function isPrivateHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, '');

  if (
    normalized === 'localhost' ||
    normalized === '::1' ||
    normalized.endsWith('.local') ||
    normalized.endsWith('.internal')
  ) {
    return true;
  }

  const ipv4 = normalized.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const parts = ipv4.slice(1).map(Number);
    if (parts.some((part) => part < 0 || part > 255)) return true;

    const [a, b] = parts;
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }

  return (
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe80:')
  );
}

export function parseSafeScanUrl(input: string): URL | null {
  try {
    const parsed = new URL(input.trim());
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    if (parsed.username || parsed.password) return null;
    if (isPrivateHostname(parsed.hostname)) return null;
    parsed.hash = '';
    return parsed;
  } catch {
    return null;
  }
}

export function permissionPatternForUrl(url: URL): string {
  return `${url.protocol}//${url.host}/*`;
}

export function isBridgeRequestMessage(value: unknown): value is BridgeRequestMessage {
  if (!isRecord(value)) return false;
  if (value.messageType !== QADDEM_BRIDGE_MESSAGE_TYPES.request) return false;
  if (value.protocol !== QADDEM_BRIDGE_PROTOCOL) return false;
  if (!isRequestId(value.requestId)) return false;

  if (value.command === 'PING') return true;
  if (!isRecord(value.payload)) return false;

  if (value.command === 'SCAN_URL') {
    return (
      typeof value.payload.url === 'string' &&
      ['quick', 'balanced', 'deep'].includes(String(value.payload.depth))
    );
  }

  if (value.command === 'CANCEL_SCAN') {
    return isRequestId(value.payload.targetRequestId);
  }

  return false;
}

export function isBridgeReadyMessage(value: unknown): value is BridgeReadyMessage {
  return (
    isRecord(value) &&
    value.messageType === QADDEM_BRIDGE_MESSAGE_TYPES.ready &&
    value.protocol === QADDEM_BRIDGE_PROTOCOL &&
    typeof value.extensionVersion === 'string'
  );
}

export function isBridgeResponseMessage(value: unknown): value is BridgeResponseMessage {
  return (
    isRecord(value) &&
    value.messageType === QADDEM_BRIDGE_MESSAGE_TYPES.response &&
    value.protocol === QADDEM_BRIDGE_PROTOCOL &&
    isRequestId(value.requestId) &&
    ['ok', 'error', 'permission_required', 'cancelled'].includes(
      String(value.status),
    ) &&
    typeof value.extensionVersion === 'string'
  );
}

export function isBridgeProgressMessage(value: unknown): value is BridgeProgressMessage {
  return (
    isRecord(value) &&
    value.messageType === QADDEM_BRIDGE_MESSAGE_TYPES.progress &&
    value.protocol === QADDEM_BRIDGE_PROTOCOL &&
    isRequestId(value.requestId) &&
    typeof value.stage === 'string' &&
    typeof value.message === 'string'
  );
}

function mergeUnique(first: string[], second: string[]): string[] {
  return Array.from(new Set([...first, ...second].map((value) => value.trim()).filter(Boolean)));
}

function canonicalUrl(input: string | null): string | null {
  if (!input) return null;
  const parsed = parseSafeScanUrl(input);
  if (!parsed) return null;
  parsed.searchParams.delete('utm_source');
  parsed.searchParams.delete('utm_medium');
  parsed.searchParams.delete('utm_campaign');
  return parsed.toString().replace(/\/$/, '').toLowerCase();
}

function recordKey(record: JobScanRecord): string {
  const urlKey = canonicalUrl(record.applyUrl) ?? canonicalUrl(record.sourceUrl);
  if (urlKey) return `url:${urlKey}`;

  return `text:${[record.title, record.company, record.location]
    .map((value) => value?.trim().toLowerCase() ?? '')
    .join('|')}`;
}

export function dedupeJobRecords(records: JobScanRecord[]): JobScanRecord[] {
  const merged = new Map<string, JobScanRecord>();

  for (const record of records) {
    const key = recordKey(record);
    const current = merged.get(key);

    if (!current) {
      merged.set(key, {
        ...record,
        emails: mergeUnique([], record.emails),
        phones: mergeUnique([], record.phones),
        forms: mergeUnique([], record.forms),
        evidence: mergeUnique([], record.evidence),
      });
      continue;
    }

    merged.set(key, {
      ...current,
      title: current.title ?? record.title,
      company: current.company ?? record.company,
      location: current.location ?? record.location,
      description:
        (record.description?.length ?? 0) > (current.description?.length ?? 0)
          ? record.description
          : current.description,
      applyUrl: current.applyUrl ?? record.applyUrl,
      emails: mergeUnique(current.emails, record.emails),
      phones: mergeUnique(current.phones, record.phones),
      forms: mergeUnique(current.forms, record.forms),
      evidence: mergeUnique(current.evidence, record.evidence),
    });
  }

  return Array.from(merged.values());
}
