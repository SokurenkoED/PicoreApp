'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';

type AppEntryButtonProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

export function AppEntryButton({ href, className, children }: AppEntryButtonProps) {
  const { me, openAuth } = useAuth();
  const isAuthenticated = Boolean(me && me.type !== 'guest');

  if (isAuthenticated) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={() => openAuth(href)}>
      {children}
    </button>
  );
}
