'use client';

import {
  QADDEM_BRIDGE_MESSAGE_TYPES,
  QADDEM_BRIDGE_PROTOCOL,
  isBridgeProgressMessage,
  isBridgeReadyMessage,
  isBridgeResponseMessage,
  parseSafeScanUrl,
  type BridgeRequestMessage,
  type BridgeScanResult,
  type JobScanRecord,
  type ScanDepth,
} from '@qaddem/shared';
import { useEffect, useRef, useState } from 'react';
import { downloadJobsExcel } from '@/lib/jobs/excel-export';

type ConnectionState = 'checking' | 'connected' | 'missing';
type ScanState =
  | 'idle'
  | 'scanning'
  | 'permission_required'
  | 'complete'
  | 'cancelled'
  | 'error';
type RequestKind = 'scan' | 'import';

interface OcrApiResult {
  sourceUrl: string;
  status: 'complete' | 'failed';
  ocrText?: string | null;
  title?: string | null;
  company?: string | null;
  location?: string | null;
  summaryAr?: string | null;
  emails?: string[];
  phones?: string[];
  forms?: string[];
}

interface OcrApiPayload {
  success?: boolean;
  processed?: number;
  failed?: number;
  error?: string;
  results?: OcrApiResult[];
}

function makeRequestId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`;
}

function displayValue(value: string | null): string {
  return value?.trim() || 'لم يُستخرج من المصدر';
}

function mergeUnique(...lists: string[][]): string[] {
  return Array.from(new Set(lists.flat().map((value) => value.trim()).filter(Boolean)));
}

function JobResultCard({ job, index }: { job: JobScanRecord; index: number }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700">
            نتيجة {index + 1} · {job.sourcePlatform}
          </p>
          <h3 className="mt-1 text-base font-black text-slate-950">
            {displayValue(job.title)}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {displayValue(job.company)} · {displayValue(job.location)}
          </p>
        </div>
        <a
          href={job.sourceUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:border-emerald-300 hover:text-emerald-800"
        >
          فتح المصدر
        </a>
      </div>

      {job.description ? (
        <p className="mt-3 line-clamp-4 text-xs leading-6 text-slate-600">
          {job.description}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
        {job.imageUrls.length ? (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">
            {job.imageUrls.length} صورة · {job.ocrStatus === 'complete' ? 'OCR مكتمل' : 'تحتاج OCR'}
          </span>
        ) : null}
        {job.emails.map((email) => (
          <span key={email} className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-800">
            {email}
          </span>
        ))}
        {job.phones.map((phone) => (
          <span key={phone} className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800">
            {phone}
          </span>
        ))}
        {job.forms.map((form) => (
          <a
            key={form}
            href={form}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full bg-violet-50 px-2.5 py-1 text-violet-800"
          >
            نموذج تقديم
          </a>
        ))}
      </div>

      {job.ocrText ? (
        <details className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-6 text-slate-600">
          <summary className="cursor-pointer font-black text-slate-800">عرض النص المستخرج من الصورة</summary>
          <p className="mt-2 whitespace-pre-wrap">{job.ocrText}</p>
        </details>
      ) : null}
    </article>
  );
}

export function ExtensionBridgePanel() {
  const [connection, setConnection] = useState<ConnectionState>('checking');
  const [extensionVersion, setExtensionVersion] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [depth, setDepth] = useState<ScanDepth>('balanced');
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [statusMessage, setStatusMessage] = useState('جارٍ التحقق من اتصال الإضافة…');
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [result, setResult] = useState<BridgeScanResult | null>(null);
  const [ocrBusy, setOcrBusy] = useState(false);
  const activeRequestId = useRef<string | null>(null);
  const activeRequestKind = useRef<RequestKind>('scan');
  const pingRequestId = useRef<string | null>(null);
  const autoImportStarted = useRef(false);

  function postRequest(message: BridgeRequestMessage) {
    window.postMessage(message, window.location.origin);
  }

  function requestLastScan(auto = false) {
    const requestId = makeRequestId('import');
    activeRequestId.current = requestId;
    activeRequestKind.current = 'import';
    setScanState('scanning');
    setStatusMessage(auto ? 'جارٍ استيراد آخر فحص من الإضافة…' : 'جارٍ طلب آخر فحص محفوظ…');
    postRequest({
      messageType: QADDEM_BRIDGE_MESSAGE_TYPES.request,
      protocol: QADDEM_BRIDGE_PROTOCOL,
      requestId,
      command: 'GET_LAST_SCAN',
    });
  }

  useEffect(() => {
    const pingId = makeRequestId('ping');
    pingRequestId.current = pingId;

    function maybeAutoImport() {
      const requested = new URLSearchParams(window.location.search).get('import') === 'last';
      if (requested && !autoImportStarted.current) {
        autoImportStarted.current = true;
        requestLastScan(true);
      }
    }

    function onMessage(event: MessageEvent<unknown>) {
      if (event.source !== window || event.origin !== window.location.origin) return;

      if (isBridgeReadyMessage(event.data)) {
        setConnection('connected');
        setExtensionVersion(event.data.extensionVersion);
        setStatusMessage(`الإضافة متصلة v${event.data.extensionVersion}`);
        window.setTimeout(maybeAutoImport, 0);
        return;
      }

      if (isBridgeProgressMessage(event.data)) {
        if (event.data.requestId !== activeRequestId.current) return;
        setStatusMessage(event.data.message);
        if (
          typeof event.data.currentRound === 'number' &&
          typeof event.data.totalRounds === 'number'
        ) {
          setProgress({
            current: event.data.currentRound,
            total: event.data.totalRounds,
          });
        }
        return;
      }

      if (!isBridgeResponseMessage(event.data)) return;

      if (event.data.requestId === pingRequestId.current) {
        if (event.data.status === 'ok') {
          setConnection('connected');
          setExtensionVersion(event.data.extensionVersion);
          setStatusMessage(`الإضافة متصلة v${event.data.extensionVersion}`);
          window.setTimeout(maybeAutoImport, 0);
        }
        return;
      }

      if (event.data.requestId !== activeRequestId.current) return;
      setExtensionVersion(event.data.extensionVersion);

      if (event.data.status === 'permission_required') {
        setScanState('permission_required');
        setStatusMessage(
          `افتح أيقونة إضافة قدّم، ثم امنح إذن النطاق ${event.data.permissionOrigin ?? ''} للمتابعة.`,
        );
        return;
      }
      if (event.data.status === 'cancelled') {
        setScanState('cancelled');
        setStatusMessage('تم إلغاء الفحص.');
        return;
      }
      if (event.data.status === 'error') {
        setScanState('error');
        setStatusMessage(event.data.error ?? 'تعذر تنفيذ الطلب.');
        return;
      }

      const responseData = event.data.data;
      if (responseData && 'jobs' in responseData) {
        setResult(responseData);
        setScanState('complete');
        setStatusMessage(
          activeRequestKind.current === 'import'
            ? `تم استيراد ${responseData.jobs.length} نتيجة من الإضافة للمراجعة.`
            : `اكتمل الفحص وعُثر على ${responseData.jobs.length} نتيجة.`,
        );
        setProgress(null);
      }
    }

    window.addEventListener('message', onMessage);
    postRequest({
      messageType: QADDEM_BRIDGE_MESSAGE_TYPES.request,
      protocol: QADDEM_BRIDGE_PROTOCOL,
      requestId: pingId,
      command: 'PING',
    });

    const timeout = window.setTimeout(() => {
      setConnection((current) => {
        if (current === 'checking') {
          setStatusMessage('الإضافة غير متصلة. ثبّت النسخة المبنية أو أعد تحميل الصفحة.');
          return 'missing';
        }
        return current;
      });
    }, 1800);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('message', onMessage);
    };
  }, []);

  function startScan() {
    const parsed = parseSafeScanUrl(url);
    if (!parsed) {
      setScanState('error');
      setStatusMessage('أدخل رابطًا عامًا صالحًا يبدأ بـ http أو https.');
      return;
    }

    const requestId = makeRequestId('scan');
    activeRequestId.current = requestId;
    activeRequestKind.current = 'scan';
    setResult(null);
    setProgress(null);
    setScanState('scanning');
    setStatusMessage('جارٍ إرسال أمر الفحص إلى الإضافة…');
    postRequest({
      messageType: QADDEM_BRIDGE_MESSAGE_TYPES.request,
      protocol: QADDEM_BRIDGE_PROTOCOL,
      requestId,
      command: 'SCAN_URL',
      payload: {
        url: parsed.toString(),
        depth,
      },
    });
  }

  function cancelScan() {
    const targetRequestId = activeRequestId.current;
    if (!targetRequestId) return;
    postRequest({
      messageType: QADDEM_BRIDGE_MESSAGE_TYPES.request,
      protocol: QADDEM_BRIDGE_PROTOCOL,
      requestId: makeRequestId('cancel'),
      command: 'CANCEL_SCAN',
      payload: { targetRequestId },
    });
  }

  async function analyzeImages() {
    if (!result) return;
    const candidates = result.jobs.filter((job) => job.imageUrls.length > 0).slice(0, 6);
    if (!candidates.length) {
      setStatusMessage('لا توجد صور إعلانات قابلة للتحليل في النتائج الحالية.');
      return;
    }

    setOcrBusy(true);
    setStatusMessage('جارٍ تحليل الصور العامة عبر Gemini OCR…');
    try {
      const response = await fetch('/api/jobs/ocr-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobs: candidates.map((job) => ({
            sourceUrl: job.sourceUrl,
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            imageUrls: job.imageUrls.slice(0, 4),
          })),
        }),
      });
      const payload = (await response.json()) as OcrApiPayload;
      if (!response.ok || !payload.success) {
        setStatusMessage(payload.error ?? 'تعذر تحليل الصور.');
        return;
      }

      const bySource = new Map((payload.results ?? []).map((item) => [item.sourceUrl, item]));
      setResult((current) => {
        if (!current) return current;
        return {
          ...current,
          jobs: current.jobs.map((job) => {
            const ocr = bySource.get(job.sourceUrl);
            if (!ocr) return job;
            const ocrText = ocr.ocrText?.trim() || null;
            return {
              ...job,
              title: job.title ?? ocr.title ?? null,
              company: job.company ?? ocr.company ?? null,
              location: job.location ?? ocr.location ?? null,
              description:
                (ocr.summaryAr?.length ?? 0) > (job.description?.length ?? 0)
                  ? ocr.summaryAr ?? null
                  : job.description,
              emails: mergeUnique(job.emails, ocr.emails ?? []),
              phones: mergeUnique(job.phones, ocr.phones ?? []),
              forms: mergeUnique(job.forms, ocr.forms ?? []),
              ocrStatus: ocr.status === 'complete' ? 'complete' : 'failed',
              ocrText,
              evidence: mergeUnique(
                job.evidence,
                ocrText ? [`OCR: ${ocrText.slice(0, 420)}`] : [],
              ),
            };
          }),
        };
      });
      setStatusMessage(`اكتمل OCR لـ ${payload.processed ?? 0} نتيجة، وتعذر ${payload.failed ?? 0}.`);
    } catch {
      setStatusMessage('تعذر الاتصال بخدمة تحليل الصور.');
    } finally {
      setOcrBusy(false);
    }
  }

  const isBusy = scanState === 'scanning' || scanState === 'permission_required';
  const imageCount = result?.jobs.reduce((total, job) => total + job.imageUrls.length, 0) ?? 0;

  return (
    <section className="mt-6 rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black text-emerald-700">Website–Extension Bridge v1.5</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">فحص واستيراد إعلانات الوظائف</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
            يقرأ البطاقات الظاهرة بعد أمر صريح منك، ويجمع النصوص والروابط والصور العامة. تحليل الصور والإرسال للموقع لا يحدثان تلقائيًا.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-black ${
            connection === 'connected'
              ? 'bg-emerald-50 text-emerald-800'
              : connection === 'checking'
                ? 'bg-amber-50 text-amber-800'
                : 'bg-rose-50 text-rose-800'
          }`}
        >
          {connection === 'connected'
            ? `الإضافة متصلة v${extensionVersion ?? '1.5.0'}`
            : connection === 'checking'
              ? 'جارٍ التحقق'
              : 'الإضافة غير متصلة'}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_180px]">
        <label>
          <span className="mb-1.5 block text-xs font-bold text-slate-700">رابط صفحة الوظائف أو الإعلان</span>
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/careers"
            inputMode="url"
            className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-bold text-slate-700">عمق الفحص</span>
          <select
            value={depth}
            onChange={(event) => setDepth(event.target.value as ScanDepth)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600"
          >
            <option value="quick">سريع · 4 جولات</option>
            <option value="balanced">متوسط · 7 جولات</option>
            <option value="deep">عميق · 12 جولة</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={startScan}
          disabled={connection !== 'connected' || isBusy}
          className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBusy ? 'الفحص قيد التنفيذ' : 'فتح الرابط وبدء الفحص'}
        </button>
        <button
          type="button"
          onClick={() => requestLastScan(false)}
          disabled={connection !== 'connected' || isBusy}
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 disabled:opacity-50"
        >
          استيراد آخر فحص من الإضافة
        </button>
        {isBusy ? (
          <button
            type="button"
            onClick={cancelScan}
            className="rounded-xl border border-rose-200 px-5 py-3 text-sm font-black text-rose-700"
          >
            إلغاء الفحص
          </button>
        ) : null}
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700" role="status">
        <p className="font-bold">{statusMessage}</p>
        {progress ? (
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${Math.min(100, (progress.current / progress.total) * 100)}%` }}
            />
          </div>
        ) : null}
      </div>

      {result?.loginRequired ? (
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
          يبدو أن المصدر يحتاج تسجيل دخول. سجّل الدخول في التبويب المفتوح ثم أعد الفحص.
        </p>
      ) : null}

      {result ? (
        <div className="mt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-950">النتائج المستخرجة</h3>
              <span className="text-xs text-slate-500">
                {result.jobs.length} نتيجة · {imageCount} صورة · {result.roundsCompleted} جولات
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={analyzeImages}
                disabled={ocrBusy || imageCount === 0}
                className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-slate-950 disabled:opacity-50"
              >
                {ocrBusy ? 'تحليل الصور…' : 'تحليل الصور OCR'}
              </button>
              <button
                type="button"
                onClick={() => downloadJobsExcel(result.jobs)}
                disabled={result.jobs.length === 0}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white disabled:opacity-50"
              >
                تصدير Excel
              </button>
            </div>
          </div>
          {result.jobs.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {result.jobs.map((job, index) => (
                <JobResultCard key={`${job.sourceUrl}-${index}`} job={job} index={index} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              لم تُكتشف بطاقات وظيفية واضحة في المحتوى الظاهر. لا تُنشأ نتائج بديلة أو وهمية.
            </p>
          )}
          <p className="mt-3 text-xs leading-6 text-slate-400">
            النتائج المستوردة معروضة للمراجعة والتصدير فقط. حفظها في الحساب وقاعدة البيانات سيُفعل بعد اكتمال تسجيل الدخول وموافقة الاستيراد.
          </p>
        </div>
      ) : null}
    </section>
  );
}
