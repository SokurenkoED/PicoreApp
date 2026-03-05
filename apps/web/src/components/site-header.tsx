'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { enHeaderItems } from '@/lib/en-sections';
import { ruHeaderItems } from '@/lib/ru-sections';
import { useAuth } from '@/components/auth-provider';

type HeaderMegaMenu = {
  title: string;
  viewAllHref: string;
  columns: Array<{
    title: string;
    links: Array<{
      label: string;
      href: string;
    }>;
  }>;
  featured: {
    badge: string;
    title: string;
    description: string;
    image: string;
    href: string;
  };
};

type HeaderItem = {
  slug: string;
  label: string;
  href: string;
  mega?: HeaderMegaMenu;
};

const desktopMainSlugs = {
  ru: new Set(['neiro-fotosessii', 'gotovye-obrazy', 'ozhivit-foto', 'otzyvy']),
  en: new Set(['ai-photoshoots', 'ready-looks', 'animate-photo', 'reviews'])
};

const desktopMoreSlugs = {
  ru: new Set(['blog', 'faq', 'sotrudnichestvo']),
  en: new Set(['blog', 'faq', 'partnerships'])
};

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MegaMenuPanel({
  menu,
  featuredActionLabel
}: {
  menu: HeaderMegaMenu;
  featuredActionLabel: string;
}) {
  return (
    <div
      className="w-full rounded-[30px] border p-5 lg:p-6"
      style={{
        borderColor: 'var(--line)',
        background: '#fffdfa',
        backdropFilter: 'blur(32px) saturate(140%)',
        WebkitBackdropFilter: 'blur(32px) saturate(140%)',
        boxShadow: '0 24px 58px rgba(16, 34, 48, 0.2)'
      }}
    >
      <div className="grid gap-6 2xl:grid-cols-[1.6fr_0.9fr]">
        <div>
          <Link
            href={menu.viewAllHref}
            className="display inline-flex items-center text-3xl font-bold text-[#18222f] transition hover:text-[#0f4a5a]"
          >
            {menu.title}
            <span className="ml-2 text-2xl" aria-hidden>
              →
            </span>
          </Link>

          <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {menu.columns.map((column) => (
              <div key={column.title}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">{column.title}</p>
                <div className="mt-3 space-y-2.5">
                  {column.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="block rounded-xl px-2 py-1 text-[15px] text-[#1f2b3b] transition hover:bg-black/5 hover:text-[#18222f]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link
          href={menu.featured.href}
          className="group hidden rounded-[26px] border p-4 transition 2xl:block"
          style={{
            borderColor: 'var(--line)',
            background: 'linear-gradient(180deg, #fffdfa, #f5efe5)'
          }}
        >
          <div className="overflow-hidden rounded-2xl" style={{ backgroundColor: 'var(--surface-muted)' }}>
            <img
              src={menu.featured.image}
              alt={menu.featured.title}
              className="h-[260px] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          </div>
          <div className="mt-4">
            <span className="inline-flex rounded-full bg-[#cd6b45] px-3 py-1 text-xs font-semibold text-white">
              {menu.featured.badge}
            </span>
            <p className="mt-3 display text-3xl font-bold leading-tight text-[#18222f]">{menu.featured.title}</p>
            <p className="mt-2 text-sm text-black/70">{menu.featured.description}</p>
            <p className="mt-4 text-base font-semibold text-[#0f4a5a]">
              {featuredActionLabel} <span aria-hidden>→</span>
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function MoreMenuPanel({
  items,
  pathname,
  onNavigate
}: {
  items: HeaderItem[];
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <div
      className="w-[300px] rounded-2xl border p-2"
      style={{
        borderColor: 'var(--line)',
        background: '#fffdfa',
        backdropFilter: 'blur(28px) saturate(140%)',
        WebkitBackdropFilter: 'blur(28px) saturate(140%)',
        boxShadow: '0 22px 52px rgba(16, 34, 48, 0.18)'
      }}
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.slug}
            href={item.href}
            onClick={onNavigate}
            className={`block rounded-xl px-3 py-2.5 text-[15px] font-medium transition ${
              active ? 'bg-black/8 text-[#18222f]' : 'text-[#1f2b3b] hover:bg-black/5'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [openMenuSlug, setOpenMenuSlug] = useState<string | null>(null);
  const { me, openAuth, logout } = useAuth();

  const isRu = pathname.startsWith('/ru');
  const localeKey = isRu ? 'ru' : 'en';
  const homeHref = isRu ? '/ru' : '/';
  const appHref = isRu ? '/ru/app' : '/app';
  const accountHref = isRu ? '/ru/app/account' : '/app/account';

  const subtitle = isRu ? 'Нейрофотостудия' : 'AI photoshoot studio';
  const moreLabel = isRu ? 'Ещё' : 'More';
  const ctaLabel = isRu ? 'Попробовать бесплатно' : 'Try for free';
  const featuredActionLabel = isRu ? 'Открыть подборку' : 'Open collection';
  const authLabel = isRu ? 'Войти' : 'Sign in';
  const logoutLabel = isRu ? 'Выйти' : 'Log out';
  const adminLabel = isRu ? 'Админка' : 'Admin';
  const accountLabel = isRu ? 'Аккаунт' : 'Account';

  const headerItems = useMemo<HeaderItem[]>(
    () => (isRu ? (ruHeaderItems as HeaderItem[]) : (enHeaderItems as HeaderItem[])),
    [isRu]
  );

  const desktopMainItems = useMemo(() => {
    const mainSlugs = desktopMainSlugs[localeKey];
    return headerItems.filter((item) => mainSlugs.has(item.slug));
  }, [headerItems, localeKey]);

  const desktopMoreItems = useMemo(() => {
    const moreSlugs = desktopMoreSlugs[localeKey];
    return headerItems.filter((item) => moreSlugs.has(item.slug));
  }, [headerItems, localeKey]);

  const activeMegaMenu = useMemo(
    () => headerItems.find((item) => item.slug === openMenuSlug)?.mega,
    [headerItems, openMenuSlug]
  );

  const isMoreOpen = openMenuSlug === 'more';
  const isMoreActive = desktopMoreItems.some((item) => isActive(pathname, item.href));
  const isAuthenticated = Boolean(me && me.type !== 'guest');
  const userLabel = me?.name || me?.email || accountLabel;
  const balanceText =
    me?.balance !== null && me?.balance !== undefined
      ? `${isRu ? 'Кредиты' : 'Credits'}: ${me.balance}`
      : null;

  useEffect(() => {
    setOpenMenuSlug(null);
  }, [pathname]);

  return (
    <header
      className="sticky top-0 z-40 border-b relative"
      style={{
        borderColor: 'var(--line)',
        background: 'linear-gradient(180deg, rgba(255, 253, 250, 0.42), rgba(247, 242, 233, 0.36))',
        backdropFilter: 'blur(64px) saturate(190%)',
        WebkitBackdropFilter: 'blur(64px) saturate(190%)',
        boxShadow: '0 12px 30px rgba(15, 39, 55, 0.09)'
      }}
    >
      <div className="container py-3 sm:py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 md:flex-nowrap md:gap-3 xl:gap-4">
          <Link href={homeHref} className="group flex shrink-0 items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f4a5a] to-[#cd6b45] text-sm font-bold text-white shadow-[0_12px_25px_rgba(24,54,73,0.24)]">
              P
            </span>
            <span>
              <span className="display block text-xl font-extrabold tracking-tight text-[#18222f]">Picoria</span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-black/55">{subtitle}</span>
            </span>
          </Link>

          <div className="hidden min-w-0 md:flex md:flex-1 md:items-center md:justify-center">
            <div className="relative" onMouseLeave={() => setOpenMenuSlug(null)}>
              <nav
                className="flex items-center gap-0.5 rounded-full border px-1.5 py-1.5 backdrop-blur-xl xl:gap-1 xl:px-2"
                style={{
                  borderColor: 'var(--line)',
                  background: 'rgba(246, 242, 235, 0.78)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.78), 0 6px 18px rgba(20, 45, 61, 0.1)'
                }}
              >
                {desktopMainItems.map((item) => {
                  const active = isActive(pathname, item.href);

                  return (
                    <Link
                      key={item.slug}
                      href={item.href}
                      onMouseEnter={() => setOpenMenuSlug(item.mega ? item.slug : null)}
                      onFocus={() => setOpenMenuSlug(item.mega ? item.slug : null)}
                      className={`rounded-full px-2.5 py-1.5 text-[14px] font-medium transition xl:px-3 xl:text-[15px] ${
                        active ? 'bg-black/8 text-[#18222f]' : 'text-[#233146] hover:bg-black/5 hover:text-[#18222f]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                <button
                  type="button"
                  onMouseEnter={() => setOpenMenuSlug('more')}
                  onFocus={() => setOpenMenuSlug('more')}
                  className={`rounded-full px-2.5 py-1.5 text-[14px] font-medium transition xl:px-3 xl:text-[15px] ${
                    isMoreActive ? 'bg-black/8 text-[#18222f]' : 'text-[#233146] hover:bg-black/5 hover:text-[#18222f]'
                  }`}
                  aria-haspopup="menu"
                  aria-expanded={isMoreOpen}
                >
                  {moreLabel}
                </button>
              </nav>

              {activeMegaMenu ? (
                <div className="absolute left-1/2 top-full z-[70] w-screen -translate-x-1/2 px-4 pt-3">
                  <div className="mx-auto w-[min(1120px,calc(100vw-2rem))]">
                    <MegaMenuPanel menu={activeMegaMenu} featuredActionLabel={featuredActionLabel} />
                  </div>
                </div>
              ) : null}

              {isMoreOpen ? (
                <div className="absolute right-0 top-full z-[70] pt-3">
                  <MoreMenuPanel items={desktopMoreItems} pathname={pathname} onNavigate={() => setOpenMenuSlug(null)} />
                </div>
              ) : null}
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated ? (
              <>
                <Link href={appHref} className="btn-cta px-5 py-2.5 text-[15px] xl:px-6 xl:py-3">
                  {ctaLabel}
                </Link>
                <Link
                  href={accountHref}
                  className="rounded-full border px-3 py-2 text-xs font-semibold text-[#1f2b3b]"
                  style={{ borderColor: 'var(--line)', background: 'rgba(255,255,255,0.78)' }}
                >
                  <span>{userLabel}</span>
                  {balanceText ? <span className="ml-2 text-black/70">{balanceText}</span> : null}
                </Link>
                {me?.role === 'admin' ? (
                  <Link href="/admin" className="btn-ghost px-4 py-2.5 text-xs">
                    {adminLabel}
                  </Link>
                ) : null}
                <button
                  className="btn-ghost px-4 py-2.5 text-xs"
                  onClick={() => void logout().catch(() => undefined)}
                >
                  {logoutLabel}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-cta px-5 py-2.5 text-[15px] xl:px-6 xl:py-3"
                  onClick={() => openAuth(appHref)}
                >
                  {ctaLabel}
                </button>
                <button className="btn-ghost px-4 py-2.5 text-xs" onClick={() => openAuth()}>
                  {authLabel}
                </button>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2 md:hidden">
            {isAuthenticated ? (
              <>
                <Link href={appHref} className="btn-cta px-4 py-2 text-sm">
                  {ctaLabel}
                </Link>
                <Link
                  href={accountHref}
                  className="rounded-full border px-3 py-2 text-xs font-semibold text-[#1f2b3b]"
                  style={{ borderColor: 'var(--line)', background: 'rgba(255,255,255,0.78)' }}
                >
                  {accountLabel}
                </Link>
                {me?.role === 'admin' ? (
                  <Link href="/admin" className="btn-ghost px-3 py-2 text-xs">
                    {adminLabel}
                  </Link>
                ) : null}
                <button
                  className="btn-ghost px-3 py-2 text-xs"
                  onClick={() => void logout().catch(() => undefined)}
                >
                  {logoutLabel}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-cta px-4 py-2 text-sm"
                  onClick={() => openAuth(appHref)}
                >
                  {ctaLabel}
                </button>
                <button className="btn-ghost px-3 py-2 text-xs" onClick={() => openAuth()}>
                  {authLabel}
                </button>
              </>
            )}
          </div>

          <div className="w-full md:hidden">
            <div className="overflow-x-auto pb-1">
              <nav
                className="flex min-w-max items-center gap-1 rounded-2xl border p-1"
                style={{ borderColor: 'var(--line)', background: 'rgba(245, 241, 234, 0.86)' }}
              >
                {headerItems.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.slug}
                      href={item.href}
                      className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${
                        active ? 'bg-black/8 text-[#18222f]' : 'text-[#233146] hover:bg-black/5 hover:text-[#18222f]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
