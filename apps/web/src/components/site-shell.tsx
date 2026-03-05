import Link from 'next/link';
import { ReactNode } from 'react';
import { SiteHeader } from '@/components/site-header';
import { AuthProvider } from '@/components/auth-provider';

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="pb-8">
        <SiteHeader />

        <main className="container py-8 sm:py-10">{children}</main>

        <footer className="container mt-6">
          <div className="card p-5 text-xs text-black/65 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p>Picoria MVP. SEO-first AI photoshoots, async generation and RU payments.</p>
              <div className="flex items-center gap-2">
                <Link href="/styles" className="rounded-full border px-3 py-1.5" style={{ borderColor: 'var(--line)' }}>
                  EN catalog
                </Link>
                <Link href="/ru/styles" className="rounded-full border px-3 py-1.5" style={{ borderColor: 'var(--line)' }}>
                  RU catalog
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
