import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppEntryButton } from '@/components/app-entry-button';
import { fetchStyleDetail } from '@/lib/api';

const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:8090';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const style = await fetchStyleDetail(params.slug, 'ru');
  if (!style) {
    return { title: 'Стиль не найден' };
  }

  const canonical = `${baseUrl}/ru/style/${style.slug}`;
  const en = `${baseUrl}/style/${style.slug}`;

  return {
    title: `${style.title} AI фотосессия`,
    description: style.description,
    alternates: {
      canonical,
      languages: {
        ru: canonical,
        en
      }
    },
    openGraph: {
      title: `${style.title} AI фотосессия`,
      description: style.description,
      url: canonical,
      images: style.sampleImages?.[0] ? [`${baseUrl}${style.sampleImages[0]}`] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: `${style.title} AI фотосессия`,
      description: style.description
    }
  };
}

export default async function RuStylePage({ params }: { params: { slug: string } }) {
  const style = await fetchStyleDetail(params.slug, 'ru');
  if (!style) {
    notFound();
  }

  const fallbackImages = ['/templates/style-card-3.svg', '/templates/style-card-4.svg'];
  const images = style.sampleImages.length > 0 ? style.sampleImages : fallbackImages;

  return (
    <article className="space-y-7">
      <header className="card p-6 sm:p-8">
        <span className="eyebrow">Страница стиля</span>
        <h1 className="section-title mt-4">{style.title}</h1>
        <p className="section-subtitle mt-3">{style.description}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.11em] text-black/65">
          <span className="rounded-full border px-3 py-1.5" style={{ borderColor: 'var(--line)' }}>
            Шаблонная сцена
          </span>
          <span className="rounded-full border px-3 py-1.5" style={{ borderColor: 'var(--line)' }}>
            4-8 результатов
          </span>
          <span className="rounded-full border px-3 py-1.5" style={{ borderColor: 'var(--line)' }}>
            Асинхронная очередь
          </span>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {images.map((image) => (
          <div key={image} className="media-frame">
            <img src={image} alt={`${style.title} шаблон превью`} />
          </div>
        ))}
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="display text-3xl font-bold">FAQ</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {style.faq.map((item, idx) => (
            <li key={idx} className="rounded-2xl border p-4" style={{ borderColor: 'var(--line)' }}>
              <p className="font-semibold">{item.q}</p>
              <p className="mt-1 text-black/70">{item.a}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="card soft-grid p-5 sm:p-6">
        <h3 className="display text-2xl font-bold">Готовы запустить генерацию?</h3>
        <p className="mt-2 max-w-2xl text-sm text-black/70">
          Загрузите фото, отправьте задачу в очередь и откройте готовые изображения после завершения.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <AppEntryButton href="/ru/app" className="btn-primary">
            Сгенерировать в этом стиле
          </AppEntryButton>
          <Link href="/ru/styles" className="btn-ghost">
            Назад в каталог
          </Link>
        </div>
      </div>
    </article>
  );
}
