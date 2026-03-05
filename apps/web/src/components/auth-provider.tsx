'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { MeResponse } from '@/types/api';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';
type OAuthProvider = 'telegram' | 'vk' | 'yandex';

type AuthContextValue = {
  me: MeResponse | null;
  loading: boolean;
  authOpen: boolean;
  openAuth: (redirectPath?: string) => void;
  closeAuth: () => void;
  refreshMe: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function parseError(response: Response): Promise<Error> {
  const text = await response.text();
  if (!text) {
    return new Error(`Request failed with status ${response.status}`);
  }
  return new Error(text);
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isRu = pathname.startsWith('/ru');
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authRedirectPath, setAuthRedirectPath] = useState<string | null>(null);

  const normalizeAuthRedirect = useCallback((redirectPath?: string): string | null => {
    if (!redirectPath) {
      return null;
    }
    if (!redirectPath.startsWith('/') || redirectPath.startsWith('//')) {
      return null;
    }
    return redirectPath;
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const response = await fetch('/api/me', { credentials: 'include' });
      if (!response.ok) {
        throw await parseError(response);
      }
      const data = (await response.json()) as MeResponse;
      setMe(data);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe, pathname]);

  const logout = useCallback(async () => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      throw await parseError(response);
    }

    await refreshMe();
  }, [refreshMe]);

  const openAuth = useCallback(
    (redirectPath?: string) => {
      setAuthRedirectPath(normalizeAuthRedirect(redirectPath));
      setAuthOpen(true);
    },
    [normalizeAuthRedirect]
  );

  const closeAuth = useCallback(() => {
    setAuthOpen(false);
    setAuthRedirectPath(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      me,
      loading,
      authOpen,
      openAuth,
      closeAuth,
      refreshMe,
      logout
    }),
    [authOpen, closeAuth, loading, logout, me, openAuth, refreshMe]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal locale={isRu ? 'ru' : 'en'} authRedirectPath={authRedirectPath} />
    </AuthContext.Provider>
  );
}

function AuthModal({
  locale,
  authRedirectPath
}: {
  locale: 'en' | 'ru';
  authRedirectPath: string | null;
}) {
  const router = useRouter();
  const { authOpen, closeAuth, refreshMe } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authOpen) {
      setMode('login');
      setPassword('');
      setResetToken('');
      setMessage('');
      setError('');
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAuth();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [authOpen, closeAuth]);

  const t = useMemo(
    () =>
      locale === 'ru'
        ? {
            title: 'Вход в Picoria',
            subtitle: 'Авторизация через email/пароль или соц. вход.',
            login: 'Войти',
            register: 'Регистрация',
            forgot: 'Восстановить пароль',
            reset: 'Сбросить пароль',
            email: 'Email',
            password: 'Пароль',
            name: 'Имя',
            submit: 'Отправить',
            close: 'Закрыть',
            noAccount: 'Нет аккаунта?',
            haveAccount: 'Уже есть аккаунт?',
            backLogin: 'Назад ко входу',
            oauthLabel: 'Или войти через',
            socialTelegram: 'Telegram',
            socialVk: 'VK',
            socialYandex: 'Yandex',
            tokenLabel: 'Токен из письма/сообщения',
            devToken: 'Dev-токен для восстановления'
          }
        : {
            title: 'Sign in to Picoria',
            subtitle: 'Use email/password or social login.',
            login: 'Sign in',
            register: 'Register',
            forgot: 'Forgot password',
            reset: 'Reset password',
            email: 'Email',
            password: 'Password',
            name: 'Name',
            submit: 'Submit',
            close: 'Close',
            noAccount: "Don't have an account?",
            haveAccount: 'Already have an account?',
            backLogin: 'Back to login',
            oauthLabel: 'Or continue with',
            socialTelegram: 'Telegram',
            socialVk: 'VK',
            socialYandex: 'Yandex',
            tokenLabel: 'Reset token',
            devToken: 'Dev reset token'
          },
    [locale]
  );

  const completeAuth = useCallback(async () => {
    await refreshMe();
    const target = authRedirectPath;
    closeAuth();
    if (target) {
      router.push(target);
    }
  }, [authRedirectPath, closeAuth, refreshMe, router]);

  const submit = async () => {
    setBusy(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'register') {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email,
            password,
            name,
            locale
          })
        });
        if (!response.ok) {
          throw await parseError(response);
        }

        await completeAuth();
        return;
      }

      if (mode === 'login') {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email,
            password,
            locale
          })
        });
        if (!response.ok) {
          throw await parseError(response);
        }

        await completeAuth();
        return;
      }

      if (mode === 'forgot') {
        const response = await fetch('/api/auth/password/forgot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email })
        });
        if (!response.ok) {
          throw await parseError(response);
        }

        const payload = (await response.json()) as { ok: boolean; token?: string };
        setMessage(payload.token ? `${t.devToken}: ${payload.token}` : 'OK');
        if (payload.token) {
          setResetToken(payload.token);
          setMode('reset');
        }
        return;
      }

      const response = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: resetToken, password })
      });
      if (!response.ok) {
        throw await parseError(response);
      }

      await completeAuth();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setBusy(false);
    }
  };

  const startOAuth = async (provider: OAuthProvider) => {
    setBusy(true);
    setError('');

    try {
      const query = new URLSearchParams({
        redirect: authRedirectPath ?? window.location.pathname,
        locale
      });

      const response = await fetch(`/api/auth/oauth/${provider}/start?${query.toString()}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw await parseError(response);
      }

      const payload = (await response.json()) as { url: string };
      window.location.href = payload.url;
    } catch (requestError) {
      setBusy(false);
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    }
  };

  if (!authOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={closeAuth}
        aria-label={t.close}
      />

      <div className="relative z-[121] w-full max-w-xl rounded-[28px] border bg-[#fffdfa] p-6 shadow-[0_20px_60px_rgba(12,34,48,0.3)]" style={{ borderColor: 'var(--line)' }}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Picoria Auth</p>
            <h2 className="display text-3xl font-bold text-[#18222f]">{t.title}</h2>
            <p className="mt-1 text-sm text-black/60">{t.subtitle}</p>
          </div>
          <button className="rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: 'var(--line)' }} onClick={closeAuth}>
            {t.close}
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <button className="btn-ghost" onClick={() => void startOAuth('telegram')} disabled={busy}>
            {t.socialTelegram}
          </button>
          <button className="btn-ghost" onClick={() => void startOAuth('vk')} disabled={busy}>
            {t.socialVk}
          </button>
          <button className="btn-ghost" onClick={() => void startOAuth('yandex')} disabled={busy}>
            {t.socialYandex}
          </button>
        </div>

        <p className="mt-4 text-center text-xs uppercase tracking-[0.12em] text-black/45">{t.oauthLabel}</p>

        <div className="mt-4 grid gap-3">
          {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
            <input
              className="w-full rounded-2xl border bg-white px-3 py-2.5 text-sm"
              style={{ borderColor: 'var(--line)' }}
              placeholder={t.email}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          )}

          {mode === 'register' ? (
            <input
              className="w-full rounded-2xl border bg-white px-3 py-2.5 text-sm"
              style={{ borderColor: 'var(--line)' }}
              placeholder={t.name}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          ) : null}

          {(mode === 'login' || mode === 'register' || mode === 'reset') && (
            <input
              className="w-full rounded-2xl border bg-white px-3 py-2.5 text-sm"
              style={{ borderColor: 'var(--line)' }}
              placeholder={t.password}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          )}

          {mode === 'reset' ? (
            <input
              className="w-full rounded-2xl border bg-white px-3 py-2.5 text-sm"
              style={{ borderColor: 'var(--line)' }}
              placeholder={t.tokenLabel}
              value={resetToken}
              onChange={(event) => setResetToken(event.target.value)}
            />
          ) : null}
        </div>

        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => void submit()} disabled={busy}>
            {busy ? '...' : mode === 'register' ? t.register : mode === 'forgot' ? t.forgot : mode === 'reset' ? t.reset : t.login}
          </button>

          {mode !== 'login' ? (
            <button className="btn-ghost" onClick={() => setMode('login')} disabled={busy}>
              {t.backLogin}
            </button>
          ) : null}

          {mode === 'login' ? (
            <button className="btn-ghost" onClick={() => setMode('register')} disabled={busy}>
              {t.noAccount}
            </button>
          ) : null}

          {mode === 'register' ? (
            <button className="btn-ghost" onClick={() => setMode('login')} disabled={busy}>
              {t.haveAccount}
            </button>
          ) : null}

          {mode === 'login' ? (
            <button className="btn-ghost" onClick={() => setMode('forgot')} disabled={busy}>
              {t.forgot}
            </button>
          ) : null}

          {mode === 'forgot' ? (
            <button className="btn-ghost" onClick={() => setMode('reset')} disabled={busy}>
              {t.reset}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
