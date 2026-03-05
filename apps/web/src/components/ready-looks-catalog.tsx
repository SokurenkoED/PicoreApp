import Link from 'next/link';
import type { PresetListItem } from '@/types/api';

type ReadyLooksCatalogProps = {
  lang: 'en' | 'ru';
  presets: PresetListItem[];
};

export function ReadyLooksCatalog({ lang, presets }: ReadyLooksCatalogProps) {
  const copy =
    lang === 'ru'
      ? {
          title: 'Готовые образы',
          count: 'пресетов в каталоге',
          empty: 'Пока нет опубликованных пресетов.',
          emptyHint: 'Добавьте пресеты в админке, и они автоматически появятся здесь.',
          action: 'Открыть пресет',
          category: 'Категория',
          model: 'Модель',
          samples: 'Примеры'
        }
      : {
          title: 'Ready Looks',
          count: 'presets in catalog',
          empty: 'No published presets yet.',
          emptyHint: 'Create presets in admin and they will appear here automatically.',
          action: 'Open preset',
          category: 'Category',
          model: 'Model',
          samples: 'Samples'
        };

  if (presets.length === 0) {
    return (
      <section className="card p-6 sm:p-8">
        <h1 className="section-title">{copy.title}</h1>
        <p className="mt-4 text-sm text-black/70">{copy.empty}</p>
        <p className="mt-1 text-sm text-black/60">{copy.emptyHint}</p>
      </section>
    );
  }

  const detailBase = lang === 'ru' ? '/ru/preset' : '/preset';

  return (
    <div className="space-y-5">
      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="section-title text-3xl sm:text-4xl">{copy.title}</h1>
          <span
            className="rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/60"
            style={{ borderColor: 'var(--line)' }}
          >
            {presets.length} {copy.count}
          </span>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {presets.map((preset) => {
          const cover = preset.coverImage ?? preset.sampleImages[0] ?? '/templates/style-card-2.svg';
          return (
            <Link
              key={preset.id}
              href={`${detailBase}/${preset.slug}`}
              className="group relative block overflow-hidden rounded-[30px] border bg-black/90"
              style={{ borderColor: 'var(--line)' }}
            >
              <img
                src={cover}
                alt={`${preset.title} cover`}
                className="h-[360px] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/70" />

              <div className="absolute inset-x-0 bottom-0 p-4 text-white transition duration-300 group-hover:opacity-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75">
                  {preset.categoryName ?? copy.category}
                </p>
                <h2 className="display mt-2 text-2xl font-bold leading-tight">{preset.title}</h2>
              </div>

              <div className="absolute inset-0 flex flex-col justify-end bg-[linear-gradient(180deg,rgba(8,18,27,0.05)_0%,rgba(8,18,27,0.7)_45%,rgba(8,18,27,0.94)_100%)] p-5 text-white opacity-0 transition duration-300 group-hover:opacity-100">
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-white/80">{preset.title}</p>
                <p className="mt-3 line-clamp-3 text-sm text-white/88">{preset.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/85">
                  <div className="rounded-2xl border border-white/25 bg-white/10 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.13em] text-white/65">{copy.model}</p>
                    <p className="mt-1 line-clamp-1 font-semibold">{preset.modelTitle ?? '-'}</p>
                  </div>
                  <div className="rounded-2xl border border-white/25 bg-white/10 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.13em] text-white/65">{copy.samples}</p>
                    <p className="mt-1 font-semibold">{Math.max(1, preset.sampleImages.length)}</p>
                  </div>
                </div>
                <span className="mt-4 inline-flex w-max items-center rounded-full border border-white/40 bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]">
                  {copy.action}
                </span>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
