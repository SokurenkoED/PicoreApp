'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { GeneratorClient } from '@/components/generator-client';

type JobStatus = 'queued' | 'processing' | 'uploading_results' | 'done' | 'failed' | 'canceled';

type JobItem = {
  id: string;
  status: JobStatus;
  progress: number | null;
  styleSlug: string;
  styleTitle: string;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  outputs: Array<{ assetId: string; url: string }>;
};

function formatDate(value: string, locale: 'en' | 'ru'): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function parseError(response: Response): Promise<Error> {
  const text = await response.text();
  return new Error(text || `Request failed (${response.status})`);
}

export function AppDashboardClient({ lang }: { lang: 'en' | 'ru' }) {
  const router = useRouter();
  const pathname = usePathname();
  const { me, loading, authOpen, openAuth } = useAuth();
  const isAuthenticated = Boolean(me && me.type !== 'guest');
  const routeLang: 'en' | 'ru' = pathname.startsWith('/ru') ? 'ru' : 'en';
  const uiLang: 'en' | 'ru' = isAuthenticated ? (me?.locale ?? routeLang) : routeLang;
  const appHref = uiLang === 'ru' ? '/ru/app' : '/app';
  const accountHref = uiLang === 'ru' ? '/ru/app/account' : '/app/account';
  const payHref = uiLang === 'ru' ? '/ru/pay' : null;
  const hasAutoPromptedRef = useRef(false);

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState('');

  const copy = useMemo(
    () =>
      uiLang === 'ru'
        ? {
            title: 'App-дэшборд',
            lead: 'Запускайте генерации, отслеживайте процессы и управляйте аккаунтом в одном рабочем пространстве.',
            signInTitle: 'Войдите, чтобы открыть App',
            signInLead: 'После авторизации здесь появится дэшборд генераций, статусы и личный кабинет.',
            signInButton: 'Войти или зарегистрироваться',
            accountButton: 'Личный кабинет',
            payButton: 'Пополнить кредиты',
            credits: 'Кредиты',
            totalJobs: 'Всего генераций',
            activeJobs: 'В процессе',
            doneJobs: 'Готово',
            recentTitle: 'Последние генерации',
            recentLead: 'Список обновляется автоматически, здесь видны текущие процессы и завершенные задачи.',
            refresh: 'Обновить',
            noJobs: 'Пока нет генераций. Загрузите фото ниже и запустите первую задачу.',
            loading: 'Загружаем дашборд...',
            loadingJobs: 'Загружаем генерации...',
            status: {
              queued: 'В очереди',
              processing: 'Генерация',
              uploading_results: 'Загрузка результатов',
              done: 'Готово',
              failed: 'Ошибка',
              canceled: 'Отменено'
            }
          }
        : {
            title: 'App Dashboard',
            lead: 'Run generations, monitor processes and manage your account from one workspace.',
            signInTitle: 'Sign in to open the App workspace',
            signInLead: 'After authentication this page shows your generation dashboard, process states and account.',
            signInButton: 'Sign in or register',
            accountButton: 'Account settings',
            payButton: 'Top up credits',
            credits: 'Credits',
            totalJobs: 'Total generations',
            activeJobs: 'In progress',
            doneJobs: 'Completed',
            recentTitle: 'Recent generations',
            recentLead: 'The list refreshes automatically and includes active processes and completed jobs.',
            refresh: 'Refresh',
            noJobs: 'No generations yet. Upload photos below and run your first job.',
            loading: 'Loading dashboard...',
            loadingJobs: 'Loading generations...',
            status: {
              queued: 'Queued',
              processing: 'Processing',
              uploading_results: 'Uploading outputs',
              done: 'Done',
              failed: 'Failed',
              canceled: 'Canceled'
            }
          },
    [uiLang]
  );

  const loadJobs = useCallback(async () => {
    if (!isAuthenticated) {
      setJobs([]);
      return;
    }

    setJobsLoading(true);
    setJobsError('');

    try {
      const response = await fetch('/api/jobs/mine', { credentials: 'include' });
      if (!response.ok) {
        throw await parseError(response);
      }
      const data = (await response.json()) as JobItem[];
      setJobs(data);
    } catch (requestError) {
      setJobsError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setJobsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void loadJobs();
    const interval = window.setInterval(() => {
      void loadJobs();
    }, 6000);

    return () => window.clearInterval(interval);
  }, [isAuthenticated, loadJobs]);

  useEffect(() => {
    if (loading || !isAuthenticated || !me) {
      return;
    }

    const expectedAppPath = me.locale === 'ru' ? '/ru/app' : '/app';
    if (pathname !== expectedAppPath) {
      router.replace(expectedAppPath);
    }
  }, [isAuthenticated, loading, me, pathname, router]);

  useEffect(() => {
    if (loading || isAuthenticated || authOpen || hasAutoPromptedRef.current) {
      return;
    }
    hasAutoPromptedRef.current = true;
    openAuth(appHref);
  }, [appHref, authOpen, isAuthenticated, loading, openAuth]);

  const metrics = useMemo(() => {
    const total = jobs.length;
    const active = jobs.filter((job) => job.status === 'queued' || job.status === 'processing' || job.status === 'uploading_results').length;
    const done = jobs.filter((job) => job.status === 'done').length;
    return { total, active, done };
  }, [jobs]);

  if (loading) {
    return (
      <section className="card p-6 sm:p-8">
        <p className="text-sm text-black/70">{copy.loading}</p>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="card p-6 sm:p-8">
        <h1 className="section-title">{copy.signInTitle}</h1>
        <p className="section-subtitle mt-3">{copy.signInLead}</p>
        <button type="button" className="btn-primary mt-5" onClick={() => openAuth(appHref)}>
          {copy.signInButton}
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="card p-6 sm:p-8">
        <span className="eyebrow">App workspace</span>
        <h1 className="section-title mt-4">{copy.title}</h1>
        <p className="section-subtitle mt-2">{copy.lead}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={accountHref} className="btn-secondary">
            {copy.accountButton}
          </Link>
          {payHref ? (
            <Link href={payHref} className="btn-ghost">
              {copy.payButton}
            </Link>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="card p-5">
          <p className="eyebrow">{copy.credits}</p>
          <p className="display mt-3 text-3xl font-bold">{me?.balance ?? 0}</p>
        </article>
        <article className="card p-5">
          <p className="eyebrow">{copy.totalJobs}</p>
          <p className="display mt-3 text-3xl font-bold">{metrics.total}</p>
        </article>
        <article className="card p-5">
          <p className="eyebrow">{copy.activeJobs}</p>
          <p className="display mt-3 text-3xl font-bold">{metrics.active}</p>
        </article>
        <article className="card p-5">
          <p className="eyebrow">{copy.doneJobs}</p>
          <p className="display mt-3 text-3xl font-bold">{metrics.done}</p>
        </article>
      </section>

      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="display text-3xl font-bold">{copy.recentTitle}</h2>
            <p className="mt-2 text-sm text-black/70">{copy.recentLead}</p>
          </div>
          <button type="button" className="btn-ghost" onClick={() => void loadJobs()} disabled={jobsLoading}>
            {copy.refresh}
          </button>
        </div>

        {jobsError ? <p className="mt-4 text-sm text-red-700">{jobsError}</p> : null}
        {jobsLoading ? <p className="mt-4 text-sm text-black/70">{copy.loadingJobs}</p> : null}

        {!jobsLoading && jobs.length === 0 ? (
          <p className="mt-4 text-sm text-black/70">{copy.noJobs}</p>
        ) : null}

        {jobs.length > 0 ? (
          <div className="mt-4 grid gap-3">
            {jobs.map((job) => {
              const isDone = job.status === 'done';
              const isError = job.status === 'failed' || job.status === 'canceled';
              return (
                <article
                  key={job.id}
                  className="rounded-2xl border bg-white/85 p-4"
                  style={{ borderColor: 'var(--line)' }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#18222f]">
                      {job.styleTitle} <span className="text-black/45">({job.styleSlug})</span>
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-700'
                          : isError
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {copy.status[job.status]}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-black/60">
                    <span>{formatDate(job.createdAt, uiLang)}</span>
                    <span>{job.progress ?? 0}%</span>
                    <span>{job.id}</span>
                  </div>
                  {job.outputs[0] ? (
                    <div className="mt-3 h-28 w-20 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--line)' }}>
                      <img src={job.outputs[0].url} alt={job.outputs[0].assetId} className="h-full w-full object-cover" />
                    </div>
                  ) : null}
                  {job.errorMessage ? <p className="mt-2 text-xs text-red-700">{job.errorMessage}</p> : null}
                </article>
              );
            })}
          </div>
        ) : null}
      </section>

      <GeneratorClient lang={uiLang} enableTelegramAuth={uiLang === 'ru'} onJobCreated={() => void loadJobs()} />
    </div>
  );
}
