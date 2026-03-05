'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/auth-provider';

async function parseError(response: Response): Promise<Error> {
  const text = await response.text();
  return new Error(text || `Request failed (${response.status})`);
}

export function AccountSettingsClient({ lang }: { lang: 'en' | 'ru' }) {
  const router = useRouter();
  const pathname = usePathname();
  const { me, loading, openAuth, refreshMe } = useAuth();
  const isAuthenticated = Boolean(me && me.type !== 'guest');
  const routeLang: 'en' | 'ru' = pathname.startsWith('/ru') ? 'ru' : 'en';
  const uiLang: 'en' | 'ru' = isAuthenticated ? (me?.locale ?? routeLang) : routeLang;
  const dashboardHref = uiLang === 'ru' ? '/ru/app' : '/app';
  const payHref = uiLang === 'ru' ? '/ru/pay' : null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [locale, setLocale] = useState<'en' | 'ru'>(lang);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileBusy, setProfileBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!me || me.type === 'guest') {
      return;
    }

    setName(me.name ?? '');
    setEmail(me.email ?? '');
    setLocale(me.locale);
  }, [me]);

  useEffect(() => {
    if (loading || !isAuthenticated || !me) {
      return;
    }

    const expectedPath = me.locale === 'ru' ? '/ru/app/account' : '/app/account';
    if (pathname !== expectedPath) {
      router.replace(expectedPath);
    }
  }, [isAuthenticated, loading, me, pathname, router]);

  const copy = useMemo(
    () =>
      uiLang === 'ru'
        ? {
            loading: 'Загружаем профиль...',
            signInTitle: 'Войдите в аккаунт',
            signInLead: 'Для доступа к личному кабинету нужна авторизация.',
            signInButton: 'Войти или зарегистрироваться',
            title: 'Личный кабинет',
            lead: 'Управляйте данными профиля, языком интерфейса и паролем.',
            dashboard: 'К App-дашборду',
            pay: 'Пополнить кредиты',
            profileTitle: 'Данные профиля',
            profileLead: 'Эти данные используются для авторизации и персонализации.',
            name: 'Имя',
            email: 'Email',
            localeRu: 'Русский',
            localeEn: 'English',
            saveProfile: 'Сохранить профиль',
            securityTitle: 'Безопасность',
            securityLead: 'Смените пароль аккаунта. Для локального входа нужен пароль от 8 символов.',
            currentPassword: 'Текущий пароль',
            newPassword: 'Новый пароль',
            confirmPassword: 'Подтвердите новый пароль',
            savePassword: 'Обновить пароль',
            profileSaved: 'Профиль обновлен.',
            passwordSaved: 'Пароль обновлен.',
            passwordMismatch: 'Новый пароль и подтверждение не совпадают.',
            passwordMin: 'Новый пароль должен быть не менее 8 символов.',
            accountType: 'Тип аккаунта',
            role: 'Роль',
            credits: 'Кредиты'
          }
        : {
            loading: 'Loading profile...',
            signInTitle: 'Sign in to your account',
            signInLead: 'Authentication is required to access account settings.',
            signInButton: 'Sign in or register',
            title: 'Account settings',
            lead: 'Manage profile data, interface locale and password.',
            dashboard: 'Back to App dashboard',
            pay: 'Top up credits',
            profileTitle: 'Profile details',
            profileLead: 'These fields are used for authentication and personalization.',
            name: 'Name',
            email: 'Email',
            localeRu: 'Russian',
            localeEn: 'English',
            saveProfile: 'Save profile',
            securityTitle: 'Security',
            securityLead: 'Change your account password. Local sign in uses a password with 8+ symbols.',
            currentPassword: 'Current password',
            newPassword: 'New password',
            confirmPassword: 'Confirm new password',
            savePassword: 'Update password',
            profileSaved: 'Profile updated.',
            passwordSaved: 'Password updated.',
            passwordMismatch: 'New password and confirmation do not match.',
            passwordMin: 'New password must contain at least 8 characters.',
            accountType: 'Account type',
            role: 'Role',
            credits: 'Credits'
          },
    [uiLang]
  );

  const saveProfile = async () => {
    setError('');
    setMessage('');

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    setProfileBusy(true);
    try {
      const payload: { email?: string; name: string | null; locale: 'en' | 'ru' } = {
        name: normalizedName ? normalizedName : null,
        locale
      };
      if (normalizedEmail) {
        payload.email = normalizedEmail;
      }

      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw await parseError(response);
      }

      await refreshMe();
      setMessage(copy.profileSaved);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setProfileBusy(false);
    }
  };

  const savePassword = async () => {
    setError('');
    setMessage('');

    if (newPassword.length < 8) {
      setError(copy.passwordMin);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(copy.passwordMismatch);
      return;
    }

    setPasswordBusy(true);
    try {
      const payload: { currentPassword?: string; newPassword: string } = { newPassword };
      const normalizedCurrent = currentPassword.trim();
      if (normalizedCurrent) {
        payload.currentPassword = normalizedCurrent;
      }

      const response = await fetch('/api/auth/password/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw await parseError(response);
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage(copy.passwordSaved);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setPasswordBusy(false);
    }
  };

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
        <button type="button" className="btn-primary mt-5" onClick={() => openAuth(pathname)}>
          {copy.signInButton}
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="card p-6 sm:p-8">
        <h1 className="section-title">{copy.title}</h1>
        <p className="section-subtitle mt-2">{copy.lead}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={dashboardHref} className="btn-secondary">
            {copy.dashboard}
          </Link>
          {payHref ? (
            <Link href={payHref} className="btn-ghost">
              {copy.pay}
            </Link>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="card p-5">
          <p className="eyebrow">{copy.accountType}</p>
          <p className="mt-3 text-lg font-semibold text-[#18222f]">{me?.type ?? '-'}</p>
        </article>
        <article className="card p-5">
          <p className="eyebrow">{copy.role}</p>
          <p className="mt-3 text-lg font-semibold text-[#18222f]">{me?.role ?? '-'}</p>
        </article>
        <article className="card p-5">
          <p className="eyebrow">{copy.credits}</p>
          <p className="mt-3 text-lg font-semibold text-[#18222f]">{me?.balance ?? 0}</p>
        </article>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="display text-3xl font-bold">{copy.profileTitle}</h2>
        <p className="mt-2 text-sm text-black/70">{copy.profileLead}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            className="w-full rounded-2xl border bg-white px-3 py-2.5 text-sm"
            style={{ borderColor: 'var(--line)' }}
            placeholder={copy.name}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <input
            className="w-full rounded-2xl border bg-white px-3 py-2.5 text-sm"
            style={{ borderColor: 'var(--line)' }}
            placeholder={copy.email}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <select
            className="w-full rounded-2xl border bg-white px-3 py-2.5 text-sm"
            style={{ borderColor: 'var(--line)' }}
            value={locale}
            onChange={(event) => setLocale(event.target.value === 'ru' ? 'ru' : 'en')}
          >
            <option value="ru">{copy.localeRu}</option>
            <option value="en">{copy.localeEn}</option>
          </select>
        </div>
        <button type="button" className="btn-primary mt-4" onClick={() => void saveProfile()} disabled={profileBusy}>
          {profileBusy ? '...' : copy.saveProfile}
        </button>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="display text-3xl font-bold">{copy.securityTitle}</h2>
        <p className="mt-2 text-sm text-black/70">{copy.securityLead}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            className="w-full rounded-2xl border bg-white px-3 py-2.5 text-sm"
            style={{ borderColor: 'var(--line)' }}
            placeholder={copy.currentPassword}
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
          <input
            className="w-full rounded-2xl border bg-white px-3 py-2.5 text-sm"
            style={{ borderColor: 'var(--line)' }}
            placeholder={copy.newPassword}
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <input
            className="w-full rounded-2xl border bg-white px-3 py-2.5 text-sm"
            style={{ borderColor: 'var(--line)' }}
            placeholder={copy.confirmPassword}
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
        <button type="button" className="btn-secondary mt-4" onClick={() => void savePassword()} disabled={passwordBusy}>
          {passwordBusy ? '...' : copy.savePassword}
        </button>
      </section>

      {error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
    </div>
  );
}
