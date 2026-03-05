import type { Metadata } from 'next';
import { PT_Sans, PT_Serif } from 'next/font/google';
import './globals.css';
import { SiteShell } from '@/components/site-shell';

const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:8090';

const bodyFont = PT_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700'],
  variable: '--font-body'
});

const displayFont = PT_Serif({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700'],
  variable: '--font-display'
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Picoria AI Photoshoot',
    template: '%s | Picoria'
  },
  description: 'AI photoshoot SaaS with EN/RU locales, async generation and RU payments.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
