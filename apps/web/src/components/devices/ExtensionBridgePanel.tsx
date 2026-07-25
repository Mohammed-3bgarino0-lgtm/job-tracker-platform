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

type ConnectionState = 'checking' | 'connected' | 'missing';
type ScanState =
  | 'idle'
  | 'scanning'
  | 'permission_required'
  | 'complete'
  | 'cancelled'
  | 'error';

function makeRequestId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`;
}

function displayValue(value: string | null): string {
  return value?.trim() || 'لم يُستخرج من المصدر';
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
  const activeRequestId = useRef<string | null>(null);
  const pingRequestId = useRef<string | null>(null);

  function postRequest(message: BridgeRequestMessage) {
    window.postMessage(message, window.location.origin);
  }

  useEffect(() => {
    const pingId = makeRequestId('ping');
    pingRequestId.current = pingId;

    function onMessage(event: MessageEvent<unknown>) {
      if (event.source !== window || event.origin !== window.location.origin) return;

      if (isBridgeReadyMessage(event.data)) {
        setConnection('connected');
        setExtensionVersion(event.data.extensionVersion);
        setStatusMessage(`الإضافة متصلة v${event.data.extensionVersion}`);
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
        setStatusMessage(event.data.error ?? 'تعذر تنفيذ الفحص.');
        return;
      }

      const responseData = event.data.data;
      if (responseData && 'jobs' in responseData) {
        setResult(responseData);
        setScanState('complete');
        setStatusMessage(`اكتمل الفحص وعُثر على ${responseData.jobs.length} نتيجة.`);
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

  const isBusy = scanState === 'scanning' || scanState === 'permission_required';

  return (
    <section className="mt-6 rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black text-emerald-700">Website–Extension Bridge v1.4</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">فحص رابط وظيفة من الموقع</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
            يفتح الفحص بعد أمر صريح منك، ويقرأ البطاقات الظاهرة فقط. لا يقرأ كلمات المرور أو الكوكيز، ولا يضغط زر إرسال طلب التوظيف.
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
            ? `الإضافة متصلة v${extensionVersion ?? '1.4.0'}`
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
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-black text-slate-950">النتائج المستخرجة</h3>
            <span className="text-xs text-slate-500">
              {result.jobs.length} نتيجة · {result.roundsCompleted} جولات
            </span>
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
            هذه النتائج تبقى في جلسة الصفحة حاليًا. الحفظ في الحساب سيُربط بعد اكتمال جلسات المستخدم وموافقة الاستيراد.
          </p>
        </div>
      ) : null}
    </section>
  );
}
