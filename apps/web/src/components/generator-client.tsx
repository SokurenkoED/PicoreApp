'use client';

import { useEffect, useMemo, useState } from 'react';
import type { MeResponse, StyleListItem } from '@/types/api';

interface GeneratorClientProps {
  lang: 'en' | 'ru';
  enableTelegramAuth?: boolean;
  onJobCreated?: (jobId: string) => void;
}

type JobStatusResponse = {
  status: 'queued' | 'processing' | 'uploading_results' | 'done' | 'failed' | 'canceled';
  progress: number | null;
  outputs: Array<{ assetId: string; url: string }>;
};

async function getImageSize(file: File): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.width, height: image.height });
      image.onerror = () => reject(new Error('Failed to load image'));
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function GeneratorClient({ lang, enableTelegramAuth, onJobCreated }: GeneratorClientProps) {
  const [styles, setStyles] = useState<StyleListItem[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [me, setMe] = useState<MeResponse | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [assetIds, setAssetIds] = useState<string[]>([]);
  const [jobId, setJobId] = useState<string>('');
  const [jobStatus, setJobStatus] = useState<JobStatusResponse | null>(null);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const t = useMemo(
    () =>
      lang === 'ru'
        ? {
            title: 'Генерация фотосессии',
            subtitle:
              'Загрузите несколько фото, выберите стиль и получите результаты после обработки задачи в очереди.',
            upload: 'Загрузить файлы',
            start: 'Запустить генерацию',
            loading: 'Выполняется...',
            auth: 'Авторизация',
            attempts: 'Бесплатных попыток осталось',
            balance: 'Баланс кредитов',
            chooseStyle: 'Выберите стиль',
            noStyles: 'Стили пока не загружены',
            dropHint: 'Рекомендуем 3-10 портретных фото, без сильного шума и размытия.',
            uploaded: 'Загружено ассетов',
            status: 'Статус',
            waiting: 'Ожидание запуска задачи',
            generateFirst: 'Сначала выберите стиль и загрузите фото',
            stylePreview: 'Шаблон превью стиля',
            outputGallery: 'Галерея результатов',
            outputPlaceholder: 'Результаты появятся здесь после завершения задачи.',
            authHint: 'Для платной генерации войдите через pop-up в шапке (Telegram / Email / VK / Yandex).'
          }
        : {
            title: 'Generate your AI photoshoot',
            subtitle:
              'Upload several reference photos, pick a style and get final images after queue processing.',
            upload: 'Upload files',
            start: 'Start generation',
            loading: 'Processing...',
            auth: 'Authentication',
            attempts: 'Free attempts left',
            balance: 'Credits balance',
            chooseStyle: 'Choose style',
            noStyles: 'No styles loaded yet',
            dropHint: 'Use 3-10 clear portraits with good lighting for stronger consistency.',
            uploaded: 'Uploaded assets',
            status: 'Status',
            waiting: 'Waiting for job start',
            generateFirst: 'Select style and upload photos first',
            stylePreview: 'Style template preview',
            outputGallery: 'Output gallery',
            outputPlaceholder: 'Generated images will appear here when the queue job is done.',
            authHint: 'For paid generations sign in from the header pop-up (Telegram / Email / VK / Yandex).'
          },
    [lang]
  );

  useEffect(() => {
    const run = async () => {
      try {
        const stylesRes = await fetch(`/api/styles?lang=${lang}`);
        const stylesData = (await stylesRes.json()) as StyleListItem[];
        setStyles(stylesData);
        if (stylesData[0]) {
          setSelectedStyle(stylesData[0].slug);
        }

        const meRes = await fetch('/api/me', { credentials: 'include' });
        const meData = (await meRes.json()) as MeResponse;
        setMe(meData);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };
    void run();
  }, [lang]);

  useEffect(() => {
    if (!jobId) {
      return;
    }

    const interval = setInterval(async () => {
      const res = await fetch(`/api/jobs/${jobId}`, { credentials: 'include' });
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as JobStatusResponse;
      setJobStatus(data);
      if (data.status === 'done' || data.status === 'failed' || data.status === 'canceled') {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  const activeStyle = styles.find((style) => style.slug === selectedStyle);
  const previewImage = activeStyle?.sampleImages?.[0] ?? '/templates/style-card-1.svg';

  const onUpload = async () => {
    setBusy(true);
    setError('');
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const presignRes = await fetch('/api/assets/presign-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            kind: 'input',
            mime: file.type,
            sizeBytes: file.size
          })
        });

        if (!presignRes.ok) {
          throw new Error('Failed to presign upload');
        }

        const presign = (await presignRes.json()) as {
          assetId: string;
          uploadUrl: string;
        };

        const putRes = await fetch(presign.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file
        });

        if (!putRes.ok) {
          throw new Error('Failed to upload file to storage');
        }

        const size = await getImageSize(file);
        await fetch('/api/assets/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            assetId: presign.assetId,
            width: size.width,
            height: size.height
          })
        });

        uploaded.push(presign.assetId);
      }
      setAssetIds(uploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const onGenerate = async () => {
    if (!selectedStyle || assetIds.length === 0) {
      setError(t.generateFirst);
      return;
    }

    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          styleSlug: selectedStyle,
          inputAssetIds: assetIds,
          clientRequestId: crypto.randomUUID()
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to create job: ${text}`);
      }

      const data = (await res.json()) as { jobId: string };
      setJobId(data.jobId);
      setJobStatus({ status: 'queued', progress: 0, outputs: [] });
      onJobCreated?.(data.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card p-6 sm:p-8">
        <span className="eyebrow">{lang === 'ru' ? 'AI workflow' : 'AI workflow'}</span>
        <h1 className="section-title mt-4">{t.title}</h1>
        <p className="section-subtitle mt-2">{t.subtitle}</p>
      </section>

      {enableTelegramAuth && (
        <div className="card p-4 text-sm text-black/70">
          {t.auth}: <span className="font-semibold">{t.authHint}</span>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <section className="card p-5">
            <div className="grid gap-2 text-sm">
              {me?.remainingFreeAttempts !== null && me?.remainingFreeAttempts !== undefined ? (
                <p>
                  {t.attempts}: <b>{me.remainingFreeAttempts}</b>
                </p>
              ) : null}
              {me?.balance !== null && me?.balance !== undefined ? (
                <p>
                  {t.balance}: <b>{me.balance}</b>
                </p>
              ) : null}
            </div>
          </section>

          <section className="card p-5">
            <label className="mb-2 block text-sm font-semibold">{t.chooseStyle}</label>
            <select
              className="w-full rounded-2xl border bg-white/90 px-3 py-2.5"
              style={{ borderColor: 'var(--line)' }}
              value={selectedStyle}
              onChange={(event) => setSelectedStyle(event.target.value)}
            >
              {styles.length === 0 ? <option>{t.noStyles}</option> : null}
              {styles.map((style) => (
                <option key={style.id} value={style.slug}>
                  {style.title}
                </option>
              ))}
            </select>
          </section>

          <section className="card p-5">
            <label className="mb-2 block text-sm font-semibold">{t.upload}</label>
            <p className="mb-3 text-xs text-black/65">{t.dropHint}</p>
            <input
              className="w-full rounded-2xl border bg-white/90 px-3 py-2.5 text-sm"
              style={{ borderColor: 'var(--line)' }}
              type="file"
              multiple
              accept="image/*"
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button className="btn-secondary" disabled={busy || files.length === 0} onClick={() => void onUpload()}>
                {busy ? t.loading : t.upload}
              </button>
              <p className="text-sm text-black/65">
                {t.uploaded}: <b>{assetIds.length}</b>
              </p>
            </div>
          </section>

          <section className="card p-5">
            <button className="btn-primary" onClick={() => void onGenerate()} disabled={busy || assetIds.length === 0}>
              {busy ? t.loading : t.start}
            </button>
            {jobId ? <p className="mt-3 break-all text-xs text-black/65">Job: {jobId}</p> : null}
            <p className="mt-2 text-sm">
              {t.status}:{' '}
              <b>{jobStatus ? `${jobStatus.status} (${jobStatus.progress ?? 0}%)` : t.waiting}</b>
            </p>
          </section>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}
        </div>

        <aside className="space-y-5">
          <section className="card p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-black/65">{t.stylePreview}</p>
            <div className="media-frame h-[340px] sm:h-[400px]">
              <img src={previewImage} alt={`${activeStyle?.title ?? 'style'} preview`} />
            </div>
          </section>

          <section className="card p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-black/65">{t.outputGallery}</p>
            {jobStatus?.outputs?.length ? (
              <div className="grid grid-cols-2 gap-3">
                {jobStatus.outputs.map((output) => (
                  <div key={output.assetId} className="media-frame">
                    <img src={output.url} alt={output.assetId} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="media-frame">
                  <img src="/templates/style-card-2.svg" alt="Output placeholder" />
                </div>
                <p className="text-sm text-black/65">{t.outputPlaceholder}</p>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
