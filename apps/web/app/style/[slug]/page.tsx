import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppEntryButton } from '@/components/app-entry-button';
import { fetchStyleDetail } from '@/lib/api';

const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:8090';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const style = await fetchStyleDetail(params.slug, 'en');
  if (!style) {
    return { title: 'Style not found' };
  }

  const canonical = `${baseUrl}/style/${style.slug}`;
  const ru = `${baseUrl}/ru/style/${style.slug}`;

  return {
    title: `${style.title} AI Photoshoot`,
    description: style.description,
    alternates: {
      canonical,
      languages: {
        en: canonical,
        ru
      }
    },
    openGraph: {
      title: `${style.title} AI Photoshoot`,
      description: style.description,
      url: canonical,
      images: style.sampleImages?.[0] ? [`${baseUrl}${style.sampleImages[0]}`] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: `${style.title} AI Photoshoot`,
      description: style.description
    }
  };
}

export default async function StylePage({ params }: { params: { slug: string } }) {
  const style = await fetchStyleDetail(params.slug, 'en');
  if (!style) {
    notFound();
  }

  const fallbackImages = ['/templates/style-card-1.svg', '/templates/style-card-2.svg'];
  const images = style.sampleImages.length > 0 ? style.sampleImages : fallbackImages;

  return (
    <article className="space-y-7">
      <header className="card p-6 sm:p-8">
        <span className="eyebrow">Style page</span>
        <h1 className="section-title mt-4">{style.title}</h1>
        <p className="section-subtitle mt-3">{style.description}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.11em] text-black/65">
          <span className="rounded-full border px-3 py-1.5" style={{ borderColor: 'var(--line)' }}>
            AI template
          </span>
          <span className="rounded-full border px-3 py-1.5" style={{ borderColor: 'var(--line)' }}>
            4-8 outputs
          </span>
          <span className="rounded-full border px-3 py-1.5" style={{ borderColor: 'var(--line)' }}>
            Queue processing
          </span>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {images.map((image) => (
          <div key={image} className="media-frame">
            <img src={image} alt={`${style.title} template sample`} />
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
        <h3 className="display text-2xl font-bold">Ready to generate this look?</h3>
        <p className="mt-2 max-w-2xl text-sm text-black/70">
          Upload your photos and run the async job queue. You can track status and open final results immediately.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <AppEntryButton href="/app" className="btn-primary">
            Generate with this style
          </AppEntryButton>
          <Link href="/styles" className="btn-ghost">
            Back to styles
          </Link>
        </div>
      </div>
    </article>
  );
}
