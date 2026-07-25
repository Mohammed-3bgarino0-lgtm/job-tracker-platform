import { CONTRACT_DATA } from './contract-data.js';

export const BRIDGE_PROTOCOL = CONTRACT_DATA.protocol;
export const EXTENSION_VERSION = CONTRACT_DATA.extensionVersion;
export const PRIMARY_WEB_ORIGIN = CONTRACT_DATA.primaryWebOrigin;
export const MESSAGE_TYPES = CONTRACT_DATA.messageTypes;
export const ALLOWED_WEB_ORIGINS = CONTRACT_DATA.allowedWebOrigins;
export const BRIDGE_LIMITS = CONTRACT_DATA.limits;

function isRecord(value) {
  return typeof value === 'object' && value !== null;
}

function isRequestId(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{8,128}$/.test(value);
}

export function isAllowedWebOrigin(origin) {
  return ALLOWED_WEB_ORIGINS.includes(origin);
}

export function isAllowedBridgeSenderUrl(input) {
  try {
    return isAllowedWebOrigin(new URL(input).origin);
  } catch {
    return false;
  }
}

function isPrivateHostname(hostname) {
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
    const [a, b, c, d] = ipv4.slice(1).map(Number);
    if ([a, b, c, d].some((part) => part < 0 || part > 255)) return true;
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

export function safeScanUrl(input) {
  try {
    const url = new URL(String(input).trim());
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (url.username || url.password) return null;
    if (isPrivateHostname(url.hostname)) return null;
    url.hash = '';
    return url;
  } catch {
    return null;
  }
}

export function permissionPatternForUrl(url) {
  return `${url.protocol}//${url.host}/*`;
}

export function roundsForDepth(depth) {
  return CONTRACT_DATA.scanRounds[depth] ?? CONTRACT_DATA.scanRounds.balanced;
}

export function isBridgeRequest(value) {
  if (!isRecord(value)) return false;
  if (value.messageType !== MESSAGE_TYPES.request) return false;
  if (value.protocol !== BRIDGE_PROTOCOL) return false;
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

export function responseMessage(requestId, status, extra = {}) {
  return {
    messageType: MESSAGE_TYPES.response,
    protocol: BRIDGE_PROTOCOL,
    requestId,
    status,
    extensionVersion: EXTENSION_VERSION,
    ...extra,
  };
}

export function progressMessage(requestId, stage, message, extra = {}) {
  return {
    messageType: MESSAGE_TYPES.progress,
    protocol: BRIDGE_PROTOCOL,
    requestId,
    stage,
    message,
    ...extra,
  };
}

function cleanList(values) {
  return Array.from(
    new Set((values ?? []).map((value) => String(value).trim()).filter(Boolean)),
  );
}

function canonicalUrl(input) {
  const url = safeScanUrl(input ?? '');
  if (!url) return null;
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    url.searchParams.delete(key);
  }
  return url.toString().replace(/\/$/, '').toLowerCase();
}

function statusRank(value) {
  return (
    {
      confirmed: 4,
      potential: 3,
      needs_ocr: 2,
      incomplete: 1,
    }[value] ?? 0
  );
}

function recordKey(record) {
  const titleKey = String(record.title ?? '').trim().toLowerCase() || '__raw__';
  if (record.sourcePlatform === 'x') {
    const sourceKey = canonicalUrl(record.sourceUrl);
    if (sourceKey) return `x:${sourceKey}|${titleKey}`;
  }

  const urlKey = canonicalUrl(record.applyUrl) ?? canonicalUrl(record.sourceUrl);
  if (urlKey) return `url:${urlKey}`;

  return `text:${[record.title, record.company, record.location]
    .map((value) => String(value ?? '').trim().toLowerCase())
    .join('|')}`;
}

export function dedupeJobs(records) {
  const merged = new Map();

  for (const rawRecord of records ?? []) {
    const imageUrls = cleanList(rawRecord.imageUrls);
    const record = {
      ...rawRecord,
      emails: cleanList(rawRecord.emails),
      phones: cleanList(rawRecord.phones),
      forms: cleanList(rawRecord.forms),
      imageUrls,
      ocrStatus:
        rawRecord.ocrStatus ?? (imageUrls.length > 0 ? 'not_requested' : 'not_applicable'),
      ocrText: rawRecord.ocrText ?? null,
      evidence: cleanList(rawRecord.evidence),
      reviewStatus: rawRecord.reviewStatus ?? 'incomplete',
      confidence: Math.max(0, Math.min(1, Number(rawRecord.confidence ?? 0))),
      rawText: rawRecord.rawText ?? null,
      authorName: rawRecord.authorName ?? null,
      authorHandle: rawRecord.authorHandle ?? null,
      publishedAt: rawRecord.publishedAt ?? null,
      sourceItemId: rawRecord.sourceItemId ?? null,
    };
    const key = recordKey(record);
    const current = merged.get(key);

    if (!current) {
      merged.set(key, record);
      continue;
    }

    const mergedImages = cleanList([...current.imageUrls, ...record.imageUrls]);
    merged.set(key, {
      ...current,
      title: current.title ?? record.title,
      company: current.company ?? record.company,
      location: current.location ?? record.location,
      description:
        String(record.description ?? '').length >
        String(current.description ?? '').length
          ? record.description
          : current.description,
      applyUrl: current.applyUrl ?? record.applyUrl,
      emails: cleanList([...current.emails, ...record.emails]),
      phones: cleanList([...current.phones, ...record.phones]),
      forms: cleanList([...current.forms, ...record.forms]),
      imageUrls: mergedImages,
      ocrStatus:
        current.ocrStatus === 'complete' || record.ocrStatus === 'complete'
          ? 'complete'
          : mergedImages.length > 0
            ? current.ocrStatus === 'failed' && record.ocrStatus === 'failed'
              ? 'failed'
              : 'not_requested'
            : 'not_applicable',
      ocrText:
        String(record.ocrText ?? '').length > String(current.ocrText ?? '').length
          ? record.ocrText
          : current.ocrText,
      evidence: cleanList([...current.evidence, ...record.evidence]),
      reviewStatus:
        statusRank(record.reviewStatus) > statusRank(current.reviewStatus)
          ? record.reviewStatus
          : current.reviewStatus,
      confidence: Math.max(Number(current.confidence ?? 0), Number(record.confidence ?? 0)),
      rawText:
        String(record.rawText ?? '').length > String(current.rawText ?? '').length
          ? record.rawText
          : current.rawText,
      authorName: current.authorName ?? record.authorName,
      authorHandle: current.authorHandle ?? record.authorHandle,
      publishedAt: current.publishedAt ?? record.publishedAt,
      sourceItemId: current.sourceItemId ?? record.sourceItemId,
    });
  }

  return Array.from(merged.values());
}
