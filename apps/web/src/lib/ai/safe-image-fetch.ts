import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export interface SafeInlineImage {
  sourceUrl: string;
  mimeType: string;
  base64Data: string;
}

function isPrivateIpv4(address: string): boolean {
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }
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

function isPrivateIp(address: string): boolean {
  const normalized = address.toLowerCase().split('%')[0];
  const family = isIP(normalized);
  if (family === 4) return isPrivateIpv4(normalized);
  if (family !== 6) return true;

  if (
    normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb')
  ) {
    return true;
  }

  const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  return mapped ? isPrivateIpv4(mapped[1]) : false;
}

async function assertPublicHttpUrl(input: string): Promise<URL> {
  const url = new URL(input);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('UNSUPPORTED_IMAGE_SCHEME');
  if (url.username || url.password) throw new Error('IMAGE_URL_CREDENTIALS');
  if (url.port && !['80', '443'].includes(url.port)) throw new Error('UNSUPPORTED_IMAGE_PORT');

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    throw new Error('PRIVATE_IMAGE_HOST');
  }

  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error('PRIVATE_IMAGE_ADDRESS');
    return url;
  }

  const addresses = await lookup(hostname, { all: true, verbatim: true });
  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateIp(address))) {
    throw new Error('PRIVATE_IMAGE_DNS');
  }
  return url;
}

export async function fetchPublicImage(input: string): Promise<SafeInlineImage> {
  let currentUrl = await assertPublicHttpUrl(input);

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    const response = await fetch(currentUrl, {
      redirect: 'manual',
      headers: {
        Accept: 'image/jpeg,image/png,image/webp,image/gif',
        'User-Agent': 'QaddemAI-ImageOCR/1.5',
      },
      signal: AbortSignal.timeout(12_000),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location || redirect === MAX_REDIRECTS) throw new Error('IMAGE_REDIRECT_LIMIT');
      currentUrl = await assertPublicHttpUrl(new URL(location, currentUrl).toString());
      continue;
    }

    if (!response.ok) throw new Error(`IMAGE_HTTP_${response.status}`);

    const mimeType = response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase();
    if (!mimeType || !ALLOWED_IMAGE_TYPES.has(mimeType)) throw new Error('UNSUPPORTED_IMAGE_TYPE');

    const announcedLength = Number(response.headers.get('content-length') ?? 0);
    if (announcedLength > MAX_IMAGE_BYTES) throw new Error('IMAGE_TOO_LARGE');

    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) throw new Error('IMAGE_TOO_LARGE');

    return {
      sourceUrl: currentUrl.toString(),
      mimeType,
      base64Data: bytes.toString('base64'),
    };
  }

  throw new Error('IMAGE_FETCH_FAILED');
}
