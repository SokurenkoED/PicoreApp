import Link from 'next/link';
import type { StyleListItem } from '@/types/api';

interface StyleGridProps {
  items: StyleListItem[];
  lang: 'en' | 'ru';
}

export function StyleGrid({ items, lang }: StyleGridProps) {
  const fallbackImages = [
    '/templates/style-card-1.svg',
    '/templates/style-card-2.svg',
    '/templates/style-card-3.svg',
    '/templates/style-card-4.svg'
  ];

  return (
    <div className="stagger grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item, idx) => {
        const href = lang === 'ru' ? `/ru/style/${item.slug}` : `/style/${item.slug}`;
        const image = item.sampleImages?.[0] ?? fallbackImages[idx % fallbackImages.length];
        return (
          <Link
            key={item.id}
            href={href}
            className="group card overflow-hidden p-3 transition duration-200 hover:-translate-y-1"
          >
            <div className="media-frame mb-4 h-64">
              <img src={image} alt={`${item.title} template preview`} />
            </div>
            <div className="px-1 pb-1">
              <span className="eyebrow mb-3">Style concept</span>
              <h3 className="display text-2xl font-bold leading-tight">{item.title}</h3>
              <p className="mt-2 text-sm text-black/70">{item.description}</p>
              <div className="mt-4 inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-black/65 transition group-hover:bg-black/5" style={{ borderColor: 'var(--line)' }}>
                {lang === 'ru' ? 'Открыть стиль' : 'Open style'}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
