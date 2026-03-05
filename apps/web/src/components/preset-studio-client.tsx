'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { MeResponse, PresetDetail, StyleListItem } from '@/types/api';

type JobStatusResponse = {
  status: 'queued' | 'processing' | 'uploading_results' | 'done' | 'failed' | 'canceled';
  progress: number | null;
  outputs: Array<{ assetId: string; url: string }>;
};

type PresetInputState = {
  goal: string;
  mood: string;
  retouchLevel: string;
  outputCount: string;
  notes: string;
};

async function parseError(response: Response): Promise<Error> {
  const text = await response.text();
  return new Error(text || `Request failed (${response.status})`);
}

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

function parseDefaultStyleSlug(value: unknown): string {
  if (!value || typeof value !== 'object') {
    return '';
  }
  const maybeSlug = (value as { styleSlug?: unknown }).styleSlug;
  return typeof maybeSlug === 'string' ? maybeSlug : '';
}

export function PresetStudioClient({ lang, preset }: { lang: 'en' | 'ru'; preset: PresetDetail }) {
  const [styles, setStyles] = useState<StyleListItem[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [me, setMe] = useState<MeResponse | null>(null);

  const [fields, setFields] = useState<PresetInputState>({
    goal: '',
    mood: 'natural',
    retouchLevel: 'balanced',
    outputCount: '4',
    notes: ''
  });

  const [files, setFiles] = useState<File[]>([]);
  const [assetIds, setAssetIds] = useState<string[]>([]);
  const [jobId, setJobId] = useState<string>('');
  const [jobStatus, setJobStatus] = useState<JobStatusResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [error, setError] = useState('');

  const t = useMemo(
    () =>
      lang === 'ru'
        ? {
            openApp: 'Открыть App',
            uploadTitle: 'Загрузите свои фотографии',
            uploadHint: 'Рекомендуем 3-10 портретных фото при хорошем освещении.',
            uploadButton: 'Загрузить фото',
            uploaded: 'Загружено',
            start: 'Запустить генерацию',
            generating: 'Выполняется...',
            status: 'Статус',
            waiting: 'Ожидание запуска',
            style: 'Стиль генерации',
            noStyles: 'Нет доступных стилей',
            fields: 'Параметры пресета',
            goal: 'Цель съемки',
            goalPlaceholder: 'Например: обложка профиля эксперта',
            mood: 'Настроение',
            moodOptions: {
              natural: 'Натуральный',
              cinematic: 'Кинематографичный',
              editorial: 'Редакционный'
            },
            retouch: 'Ретушь',
            retouchOptions: {
              soft: 'Мягкая',
              balanced: 'Сбалансированная',
              bold: 'Выразительная'
            },
            outputs: 'Количество кадров',
            notes: 'Комментарий',
            notesPlaceholder: 'Можно указать фон, свет, одежду, позу и т.д.',
            credits: 'Кредиты',
            attempts: 'Бесплатных попыток',
            preview: 'Примеры пресета',
            result: 'Результат генерации',
            placeholder: 'После завершения задачи здесь появятся готовые изображения.',
            authHint: 'Для безлимитных запусков авторизуйтесь в личном кабинете.',
            toCatalog: 'Назад к готовым образам'
          }
        : {
            openApp: 'Open App',
            uploadTitle: 'Upload your photos',
            uploadHint: 'Use 3-10 clear portraits with good lighting.',
            uploadButton: 'Upload photos',
            uploaded: 'Uploaded',
            start: 'Start generation',
            generating: 'Processing...',
            status: 'Status',
            waiting: 'Waiting to start',
            style: 'Generation style',
            noStyles: 'No styles available',
            fields: 'Preset fields',
            goal: 'Shoot goal',
            goalPlaceholder: 'Example: expert profile cover image',
            mood: 'Mood',
            moodOptions: {
              natural: 'Natural',
              cinematic: 'Cinematic',
              editorial: 'Editorial'
            },
            retouch: 'Retouch',
            retouchOptions: {
              soft: 'Soft',
              balanced: 'Balanced',
              bold: 'Bold'
            },
            outputs: 'Output count',
            notes: 'Extra notes',
            notesPlaceholder: 'Specify background, light, wardrobe, pose, etc.',
            credits: 'Credits',
            attempts: 'Free attempts',
            preview: 'Preset samples',
            result: 'Generation result',
            placeholder: 'Generated images will appear here when the task is complete.',
            authHint: 'Sign in from your account for unlimited launches.',
            toCatalog: 'Back to ready looks'
          },
    [lang]
  );

  useEffect(() => {
    const run = async () => {
      setLoadingInit(true);
      setError('');
      try {
        const [stylesResponse, meResponse] = await Promise.all([
          fetch(`/api/styles?lang=${lang}`),
          fetch('/api/me', { credentials: 'include' })
        ]);

        if (!stylesResponse.ok) {
          throw await parseError(stylesResponse);
        }

        const stylesData = (await stylesResponse.json()) as StyleListItem[];
        const meData = (await meResponse.json()) as MeResponse;
        setStyles(stylesData);
        setMe(meData);

        const presetDefaultStyle = parseDefaultStyleSlug(preset.defaultParams);
        if (presetDefaultStyle && stylesData.some((item) => item.slug === presetDefaultStyle)) {
          setSelectedStyle(presetDefaultStyle);
        } else if (stylesData[0]) {
          setSelectedStyle(stylesData[0].slug);
        }
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : String(requestError));
      } finally {
        setLoadingInit(false);
      }
    };

    void run();
  }, [lang, preset.defaultParams]);

  useEffect(() => {
    if (!jobId) {
      return;
    }

    const interval = window.setInterval(async () => {
      const response = await fetch(`/api/jobs/${jobId}`, { credentials: 'include' });
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as JobStatusResponse;
      setJobStatus(data);
      if (data.status === 'done' || data.status === 'failed' || data.status === 'canceled') {
        window.clearInterval(interval);
      }
    }, 2500);

    return () => window.clearInterval(interval);
  }, [jobId]);

  const onUpload = async () => {
    if (files.length === 0) {
      return;
    }

    setBusy(true);
    setError('');
    try {
      const uploaded: string[] = [];

      for (const file of files) {
        const presignResponse = await fetch('/api/assets/presign-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            kind: 'input',
            mime: file.type,
            sizeBytes: file.size
          })
        });

        if (!presignResponse.ok) {
          throw await parseError(presignResponse);
        }

        const presign = (await presignResponse.json()) as { assetId: string; uploadUrl: string };

        const uploadResponse = await fetch(presign.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload to storage');
        }

        const size = await getImageSize(file);
        const completeResponse = await fetch('/api/assets/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            assetId: presign.assetId,
            width: size.width,
            height: size.height
          })
        });

        if (!completeResponse.ok) {
          throw await parseError(completeResponse);
        }

        uploaded.push(presign.assetId);
      }

      setAssetIds(uploaded);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setBusy(false);
    }
  };

  const onGenerate = async () => {
    if (!selectedStyle || assetIds.length === 0) {
      return;
    }

    setBusy(true);
    setError('');

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          styleSlug: selectedStyle,
          inputAssetIds: assetIds,
          clientRequestId: crypto.randomUUID(),
          presetSlug: preset.slug,
          presetInputs: fields
        })
      });

      if (!response.ok) {
        throw await parseError(response);
      }

      const data = (await response.json()) as { jobId: string };
      setJobId(data.jobId);
      setJobStatus({ status: 'queued', progress: 0, outputs: [] });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setBusy(false);
    }
  };

  const previewImages = preset.sampleImages.length > 0 ? preset.sampleImages : ['/templates/style-card-2.svg'];
  const appHref = lang === 'ru' ? '/ru/app' : '/app';
  const catalogHref = lang === 'ru' ? '/ru/gotovye-obrazy' : '/ready-looks';

  return (
    <div className="space-y-6">
      <section className="card relative overflow-hidden p-6 sm:p-8">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#cf744f]/24 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 h-64 w-64 rounded-full bg-[#0f4a5a]/18 blur-3xl" />

        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="eyebrow">Preset Studio</span>
              <h1 className="display mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">{preset.title}</h1>
              <p className="mt-3 max-w-3xl text-sm text-black/70 sm:text-base">{preset.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={catalogHref} className="btn-ghost px-5 py-2.5 text-xs sm:text-sm">
                {t.toCatalog}
              </Link>
              <Link href={appHref} className="btn-secondary px-5 py-2.5 text-xs sm:text-sm">
                {t.openApp}
              </Link>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.11em] text-black/65">
            {preset.categoryName ? (
              <span className="rounded-full border px-3 py-1.5" style={{ borderColor: 'var(--line)' }}>
                {preset.categoryName}
              </span>
            ) : null}
            <span className="rounded-full border px-3 py-1.5" style={{ borderColor: 'var(--line)' }}>
              {preset.modelTitle ?? t.style}
            </span>
            <span className="rounded-full border px-3 py-1.5" style={{ borderColor: 'var(--line)' }}>
              {previewImages.length} {lang === 'ru' ? 'референсов' : 'references'}
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="space-y-5">
          <article className="card p-5">
            <h2 className="display text-2xl font-bold">{t.uploadTitle}</h2>
            <p className="mt-2 text-sm text-black/65">{t.uploadHint}</p>
            <input
              className="mt-4 w-full rounded-2xl border bg-white px-3 py-2.5 text-sm"
              style={{ borderColor: 'var(--line)' }}
              type="file"
              multiple
              accept="image/*"
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button type="button" className="btn-secondary" onClick={() => void onUpload()} disabled={busy || files.length === 0}>
                {busy ? t.generating : t.uploadButton}
              </button>
              <p className="text-sm text-black/65">
                {t.uploaded}: <b>{assetIds.length}</b>
              </p>
            </div>
          </article>

          <article className="card p-5">
            <h2 className="display text-2xl font-bold">{t.fields}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-semibold">{t.style}</span>
                <select
                  className="w-full rounded-2xl border bg-white px-3 py-2.5"
                  style={{ borderColor: 'var(--line)' }}
                  value={selectedStyle}
                  onChange={(event) => setSelectedStyle(event.target.value)}
                >
                  {styles.length === 0 ? <option>{t.noStyles}</option> : null}
                  {styles.map((item) => (
                    <option key={item.id} value={item.slug}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-semibold">{t.outputs}</span>
                <select
                  className="w-full rounded-2xl border bg-white px-3 py-2.5"
                  style={{ borderColor: 'var(--line)' }}
                  value={fields.outputCount}
                  onChange={(event) => setFields((prev) => ({ ...prev, outputCount: event.target.value }))}
                >
                  <option value="4">4</option>
                  <option value="8">8</option>
                </select>
              </label>

              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block font-semibold">{t.goal}</span>
                <input
                  className="w-full rounded-2xl border bg-white px-3 py-2.5"
                  style={{ borderColor: 'var(--line)' }}
                  value={fields.goal}
                  onChange={(event) => setFields((prev) => ({ ...prev, goal: event.target.value }))}
                  placeholder={t.goalPlaceholder}
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-semibold">{t.mood}</span>
                <select
                  className="w-full rounded-2xl border bg-white px-3 py-2.5"
                  style={{ borderColor: 'var(--line)' }}
                  value={fields.mood}
                  onChange={(event) => setFields((prev) => ({ ...prev, mood: event.target.value }))}
                >
                  <option value="natural">{t.moodOptions.natural}</option>
                  <option value="cinematic">{t.moodOptions.cinematic}</option>
                  <option value="editorial">{t.moodOptions.editorial}</option>
                </select>
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-semibold">{t.retouch}</span>
                <select
                  className="w-full rounded-2xl border bg-white px-3 py-2.5"
                  style={{ borderColor: 'var(--line)' }}
                  value={fields.retouchLevel}
                  onChange={(event) => setFields((prev) => ({ ...prev, retouchLevel: event.target.value }))}
                >
                  <option value="soft">{t.retouchOptions.soft}</option>
                  <option value="balanced">{t.retouchOptions.balanced}</option>
                  <option value="bold">{t.retouchOptions.bold}</option>
                </select>
              </label>

              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block font-semibold">{t.notes}</span>
                <textarea
                  className="w-full rounded-2xl border bg-white px-3 py-2.5"
                  style={{ borderColor: 'var(--line)' }}
                  value={fields.notes}
                  onChange={(event) => setFields((prev) => ({ ...prev, notes: event.target.value }))}
                  rows={3}
                  placeholder={t.notesPlaceholder}
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => void onGenerate()}
                disabled={busy || assetIds.length === 0 || !selectedStyle}
              >
                {busy ? t.generating : t.start}
              </button>
              <p className="text-sm text-black/65">
                {t.status}:{' '}
                <b>{jobStatus ? `${jobStatus.status} (${jobStatus.progress ?? 0}%)` : t.waiting}</b>
              </p>
            </div>

            {jobId ? <p className="mt-2 break-all text-xs text-black/60">Job: {jobId}</p> : null}
          </article>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          {loadingInit ? <p className="text-sm text-black/60">Loading...</p> : null}
        </section>

        <aside className="space-y-5">
          <section className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/60">{t.preview}</p>
              <p className="text-xs text-black/55">
                {t.attempts}: <b>{me?.remainingFreeAttempts ?? '-'}</b> · {t.credits}: <b>{me?.balance ?? '-'}</b>
              </p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {previewImages.slice(0, 6).map((image, index) => (
                <div key={`${image}-${index}`} className="media-frame h-40">
                  <img src={image} alt={`${preset.title} ${index + 1}`} />
                </div>
              ))}
            </div>
          </section>

          <section className="card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/60">{t.result}</p>
            {jobStatus?.outputs?.length ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {jobStatus.outputs.map((output) => (
                  <div key={output.assetId} className="media-frame">
                    <img src={output.url} alt={output.assetId} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3">
                <div className="media-frame h-60">
                  <img src="/templates/style-card-3.svg" alt="Output placeholder" />
                </div>
                <p className="mt-3 text-sm text-black/65">{t.placeholder}</p>
                <p className="mt-1 text-xs text-black/55">{t.authHint}</p>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
