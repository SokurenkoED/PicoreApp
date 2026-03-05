import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const INTERNAL_API_BASE_URL = process.env.INTERNAL_API_BASE_URL ?? 'http://localhost:3001/api';

type AdminMe = {
  role: 'user' | 'admin';
};

async function fetchMe(): Promise<AdminMe | null> {
  const cookie = headers().get('cookie') ?? '';
  const response = await fetch(`${INTERNAL_API_BASE_URL}/me`, {
    cache: 'no-store',
    headers: {
      cookie
    }
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<AdminMe>;
}

export default async function RuAdminLayout({ children }: { children: React.ReactNode }) {
  const me = await fetchMe();
  if (!me || me.role !== 'admin') {
    redirect('/ru');
  }

  return <>{children}</>;
}
