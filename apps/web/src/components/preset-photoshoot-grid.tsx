import type { PhotoshootListItem, PresetListItem } from '@/types/api';

interface PresetPhotoshootGridProps {
  lang: 'en' | 'ru';
  presets: PresetListItem[];
  photoshoots: PhotoshootListItem[];
}

export function PresetPhotoshootGrid({ lang, presets, photoshoots }: PresetPhotoshootGridProps) {
  if (presets.length === 0 && photoshoots.length === 0) {
    return null;
  }

  return (
    <div className="space-y-7">
      {presets.length > 0 ? (
        <section className="card p-5 sm:p-6">
          <h2 className="display text-3xl font-bold">{lang === 'ru' ? 'Пресеты' : 'Presets'}</h2>
          <p className="mt-2 text-sm text-black/70">
            {lang === 'ru'
              ? 'Публикуются из админ-панели мгновенно.'
              : 'Published from admin panel in real time.'}
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {presets.map((preset) => (
              <article key={preset.id} className="rounded-2xl border p-3" style={{ borderColor: 'var(--line)' }}>
                <div className="media-frame mb-3 h-52">
                  <img
                    src={preset.coverImage ?? preset.sampleImages?.[0] ?? '/templates/style-card-2.svg'}
                    alt={`${preset.title} preview`}
                  />
                </div>
                <p className="text-xs uppercase tracking-[0.12em] text-black/55">{preset.modelTitle ?? 'Model'}</p>
                <h3 className="display mt-1 text-2xl font-bold">{preset.title}</h3>
                {preset.categoryName ? (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#0f4a5a]">
                    {lang === 'ru' ? `Категория: ${preset.categoryName}` : `Category: ${preset.categoryName}`}
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-black/70">{preset.description}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {photoshoots.length > 0 ? (
        <section className="card p-5 sm:p-6">
          <h2 className="display text-3xl font-bold">{lang === 'ru' ? 'Фотосессии' : 'Photoshoots'}</h2>
          <p className="mt-2 text-sm text-black/70">
            {lang === 'ru'
              ? 'Новые фотосессии появляются после добавления администратором.'
              : 'New photoshoots appear right after admin publishing.'}
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {photoshoots.map((photoshoot) => (
              <article key={photoshoot.id} className="rounded-2xl border p-3" style={{ borderColor: 'var(--line)' }}>
                <div className="media-frame mb-3 h-52">
                  <img
                    src={photoshoot.coverImage ?? photoshoot.galleryImages?.[0] ?? '/templates/style-card-3.svg'}
                    alt={`${photoshoot.title} preview`}
                  />
                </div>
                <p className="text-xs uppercase tracking-[0.12em] text-black/55">{photoshoot.modelTitle ?? 'Model'}</p>
                <h3 className="display mt-1 text-2xl font-bold">{photoshoot.title}</h3>
                <p className="mt-2 text-sm text-black/70">{photoshoot.description}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
