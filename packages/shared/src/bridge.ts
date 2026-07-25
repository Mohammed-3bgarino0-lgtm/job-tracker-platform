import contract from './bridge-contract.json';

export const QADDEM_BRIDGE_PROTOCOL = contract.protocol;
export const QADDEM_EXTENSION_VERSION = contract.extensionVersion;
export const QADDEM_PRIMARY_WEB_ORIGIN = contract.primaryWebOrigin;
export const QADDEM_BRIDGE_MESSAGE_TYPES = contract.messageTypes;
export const QADDEM_ALLOWED_WEB_ORIGINS = contract.allowedWebOrigins;
export const QADDEM_BRIDGE_LIMITS = contract.limits;

export type ScanDepth = keyof typeof contract.scanRounds;
export type BridgeCommand = 'PING' | 'SCAN_URL' | 'CANCEL_SCAN' | 'GET_LAST_SCAN';
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
export type JobOcrStatus =
  | 'not_applicable'
  | 'not_requested'
  | 'complete'
  | 'failed';
export type JobReviewStatus =
  | 'confirmed'
  | 'potential'
  | 'needs_ocr'
  | 'incomplete';

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
  imageUrls: string[];
  ocrStatus: JobOcrStatus;
  ocrText: string | null;
  evidence: string[];
  detectedAt: string;
  reviewStatus?: JobReviewStatus;
  confidence?: number;
  rawText?: string | null;
  authorName?: string | null;
  authorHandle?: string | null;
  publishedAt?: string | null;
  sourceItemId?: string | null;
}

export interface BridgeScanResult {
  scannedUrl: string;
  jobs: JobScanRecord[];
  loginRequired: boolean;
  roundsCompleted: number;
  partial: boolean;
  truncated?: boolean;
  stopReason?: string;
  sourceItemsScanned?: number;
  confirmedCount?: number;
  potentialCount?: number;
  needsOcrCount?: number;
  incompleteCount?: number;
  targetTabId?: number;
  completedAt?: string;
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
      command: 'GET_LAST_SCAN';
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

  if (value.command === 'PING' || value.command === 'GET_LAST_SCAN') return true;
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
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    parsed.searchParams.delete(key);
  }
  return parsed.toString().replace(/\/$/, '').toLowerCase();
}

function statusRank(status: JobReviewStatus | undefined): number {
  return (
    {
      confirmed: 4,
      potential: 3,
      needs_ocr: 2,
      incomplete: 1,
    }[status ?? 'incomplete'] ?? 0
  );
}

function recordKey(record: JobScanRecord): string {
  const titleKey = record.title?.trim().toLowerCase() || '__raw__';
  if (record.sourcePlatform === 'x') {
    const sourceKey = canonicalUrl(record.sourceUrl);
    if (sourceKey) return `x:${sourceKey}|${titleKey}`;
  }

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
    const normalized: JobScanRecord = {
      ...record,
      emails: mergeUnique([], record.emails),
      phones: mergeUnique([], record.phones),
      forms: mergeUnique([], record.forms),
      imageUrls: mergeUnique([], record.imageUrls),
      evidence: mergeUnique([], record.evidence),
      reviewStatus: record.reviewStatus ?? 'incomplete',
      confidence: Math.max(0, Math.min(1, Number(record.confidence ?? 0))),
      rawText: record.rawText ?? null,
      authorName: record.authorName ?? null,
      authorHandle: record.authorHandle ?? null,
      publishedAt: record.publishedAt ?? null,
      sourceItemId: record.sourceItemId ?? null,
    };
    const current = merged.get(key);

    if (!current) {
      merged.set(key, normalized);
      continue;
    }

    const imageUrls = mergeUnique(current.imageUrls, normalized.imageUrls);
    const ocrStatus =
      current.ocrStatus === 'complete' || normalized.ocrStatus === 'complete'
        ? 'complete'
        : imageUrls.length > 0
          ? current.ocrStatus === 'failed' && normalized.ocrStatus === 'failed'
            ? 'failed'
            : 'not_requested'
          : 'not_applicable';

    merged.set(key, {
      ...current,
      title: current.title ?? normalized.title,
      company: current.company ?? normalized.company,
      location: current.location ?? normalized.location,
      description:
        (normalized.description?.length ?? 0) > (current.description?.length ?? 0)
          ? normalized.description
          : current.description,
      applyUrl: current.applyUrl ?? normalized.applyUrl,
      emails: mergeUnique(current.emails, normalized.emails),
      phones: mergeUnique(current.phones, normalized.phones),
      forms: mergeUnique(current.forms, normalized.forms),
      imageUrls,
      ocrStatus,
      ocrText:
        (normalized.ocrText?.length ?? 0) > (current.ocrText?.length ?? 0)
          ? normalized.ocrText
          : current.ocrText,
      evidence: mergeUnique(current.evidence, normalized.evidence),
      reviewStatus:
        statusRank(normalized.reviewStatus) > statusRank(current.reviewStatus)
          ? normalized.reviewStatus
          : current.reviewStatus,
      confidence: Math.max(Number(current.confidence ?? 0), Number(normalized.confidence ?? 0)),
      rawText:
        (normalized.rawText?.length ?? 0) > (current.rawText?.length ?? 0)
          ? normalized.rawText
          : current.rawText,
      authorName: current.authorName ?? normalized.authorName,
      authorHandle: current.authorHandle ?? normalized.authorHandle,
      publishedAt: current.publishedAt ?? normalized.publishedAt,
      sourceItemId: current.sourceItemId ?? normalized.sourceItemId,
    });
  }

  return Array.from(merged.values());
}
