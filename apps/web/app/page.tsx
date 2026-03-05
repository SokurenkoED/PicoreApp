import Link from 'next/link';
import { AppEntryButton } from '@/components/app-entry-button';

type ExampleItem = {
  image: string;
  title: string;
};

function ExampleRow({
  items,
  direction = 'ltr',
  animated = false
}: {
  items: ExampleItem[];
  direction?: 'ltr' | 'rtl';
  animated?: boolean;
}) {
  const loopItems = animated ? [...items, ...items] : items;

  if (!animated) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {loopItems.map((item) => (
          <figure
            key={item.image}
            className="media-frame overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
          >
            <img src={item.image} alt={`${item.title} example`} />
            <figcaption
              className="border-t px-3 py-2 text-xs font-semibold uppercase tracking-[0.11em] text-black/65"
              style={{ borderColor: 'var(--line)' }}
            >
              {item.title}
            </figcaption>
          </figure>
        ))}
      </div>
    );
  }

  return (
    <div className="examples-motion-shell">
      <div
        className={`examples-motion-track ${
          direction === 'ltr' ? 'examples-motion-ltr' : 'examples-motion-rtl'
        }`}
      >
        {loopItems.map((item, index) => (
          <div key={`${item.image}-${index}`} className="examples-motion-item">
            <figure className="media-frame overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
              <img src={item.image} alt={`${item.title} example`} />
              <figcaption
                className="border-t px-3 py-2 text-xs font-semibold uppercase tracking-[0.11em] text-black/65"
                style={{ borderColor: 'var(--line)' }}
              >
                {item.title}
              </figcaption>
            </figure>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const photoshootExamples = [
    { image: '/samples/dramatic-light-1.svg', title: 'Studio dramatic' },
    { image: '/samples/beauty-closeup-1.svg', title: 'Beauty close-up' },
    { image: '/samples/cinematic-portrait-1.svg', title: 'Cinematic portrait' },
    { image: '/samples/luxury-fashion-1.svg', title: 'Luxury fashion' },
    { image: '/samples/corporate-headshots-1.svg', title: 'Business headshot' }
  ];

  const presetExamples = [
    { image: '/templates/style-card-1.svg', title: 'Preset: Clean light' },
    { image: '/templates/style-card-2.svg', title: 'Preset: Warm film' },
    { image: '/templates/style-card-3.svg', title: 'Preset: Soft editorial' },
    { image: '/templates/style-card-4.svg', title: 'Preset: Rich contrast' },
    { image: '/templates/hero-shot-1.svg', title: 'Preset: Signature mix' }
  ];

  const coupleGroupExamples = [
    { image: '/samples/wedding-classic-1.svg', title: 'Couple classic' },
    { image: '/samples/travel-lifestyle-1.svg', title: 'Couple lifestyle' },
    { image: '/samples/retro-film-1.svg', title: 'Friends retro set' },
    { image: '/samples/streetwear-editorial-1.svg', title: 'Group editorial' },
    { image: '/samples/fitness-pro-1.svg', title: 'Team sport set' }
  ];

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="card reveal relative overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#0f4a5a]/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[#cd6b45]/10 blur-3xl" />
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="eyebrow">AI photoshoot platform</span>
            <h1 className="display mt-5 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Stylish portraits in
              <span className="block text-[#0f4a5a]">one async workflow</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base text-black/75 sm:text-lg">
              Picoria combines style catalog pages, queued generation and delivery-ready outputs. Upload photos, pick
              a look and receive polished results in minutes.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/styles" className="btn-primary">
                Browse styles
              </Link>
              <AppEntryButton href="/app" className="btn-cta">
                Start free generation
              </AppEntryButton>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="metric-card">
                <p className="display text-2xl font-extrabold">6x</p>
                <p className="text-xs text-black/65">faster than manual photoshoot prep</p>
              </div>
              <div className="metric-card">
                <p className="display text-2xl font-extrabold">12+</p>
                <p className="text-xs text-black/65">style directions already published</p>
              </div>
              <div className="metric-card">
                <p className="display text-2xl font-extrabold">24/7</p>
                <p className="text-xs text-black/65">asynchronous queue and delivery</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="media-frame sm:col-span-2">
              <img src="/templates/hero-shot-1.svg" alt="Template hero portrait" />
            </div>
            <div className="media-frame">
              <img src="/templates/style-card-1.svg" alt="Template style card" />
            </div>
            <div className="media-frame">
              <img src="/templates/style-card-2.svg" alt="Template style card" />
            </div>
          </div>
        </div>
      </section>

      <section className="reveal space-y-5 pb-2">
        <div>
          <span className="eyebrow">Photoshoot creation</span>
          <h2 className="section-title mt-3">Examples of ready photoshoots</h2>
          <p className="section-subtitle mt-2">
            Focus on complete photoshoot results: from source photos to production-ready visuals.
          </p>
        </div>
        <ExampleRow items={photoshootExamples} direction="ltr" animated />
      </section>

      <section className="reveal space-y-5 pb-2">
        <div>
          <span className="eyebrow">Preset workflow</span>
          <h2 className="section-title mt-3">Working with presets</h2>
          <p className="section-subtitle mt-2">
            Build your catalog by combining reusable preset packs with style-specific references.
          </p>
        </div>
        <ExampleRow items={presetExamples} direction="rtl" animated />
      </section>

      <section className="reveal space-y-5 pb-2">
        <div>
          <span className="eyebrow">Couple and group</span>
          <h2 className="section-title mt-3">Examples: couple and group sessions</h2>
          <p className="section-subtitle mt-2">
            Dedicated references for duo and group compositions with coherent scene style.
          </p>
        </div>
        <ExampleRow items={coupleGroupExamples} direction="ltr" animated />
      </section>

      <section className="reveal space-y-4">
        <div>
          <span className="eyebrow">How it works</span>
          <h2 className="section-title mt-3">Three clear steps from upload to gallery</h2>
          <p className="section-subtitle mt-2">
            The flow mirrors high-performing AI photoshoot landing pages: simple decision, visible progress, instant
            value.
          </p>
        </div>
        <div className="stagger grid gap-4 md:grid-cols-3">
          <article className="card p-5">
            <p className="eyebrow">Step 01</p>
            <h3 className="display mt-3 text-2xl font-bold">Upload references</h3>
            <p className="mt-2 text-sm text-black/70">
              Add multiple portrait photos via presigned upload for secure, fast transfer.
            </p>
          </article>
          <article className="card p-5">
            <p className="eyebrow">Step 02</p>
            <h3 className="display mt-3 text-2xl font-bold">Pick a visual style</h3>
            <p className="mt-2 text-sm text-black/70">
              Choose from cinematic, beauty, business and lifestyle directions.
            </p>
          </article>
          <article className="card p-5">
            <p className="eyebrow">Step 03</p>
            <h3 className="display mt-3 text-2xl font-bold">Receive final set</h3>
            <p className="mt-2 text-sm text-black/70">
              Watch queue progress and open signed URLs of generated results in your gallery.
            </p>
          </article>
        </div>
      </section>

      <section className="reveal card p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="eyebrow">Template results</span>
            <h2 className="section-title mt-3">Before / after blocks ready for ads</h2>
          </div>
          <AppEntryButton href="/app" className="btn-ghost">
            Run your own test
          </AppEntryButton>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="media-frame">
            <img src="/templates/before-after-1.svg" alt="Template before after one" />
          </div>
          <div className="media-frame">
            <img src="/templates/before-after-2.svg" alt="Template before after two" />
          </div>
        </div>
      </section>

      <section className="reveal">
        <div className="mb-4">
          <span className="eyebrow">Social proof block</span>
          <h2 className="section-title mt-3">Template testimonials and creator cards</h2>
        </div>
        <div className="stagger grid gap-4 lg:grid-cols-3">
          <div className="media-frame">
            <img src="/templates/testimonial-1.svg" alt="Template testimonial one" />
          </div>
          <div className="media-frame">
            <img src="/templates/testimonial-2.svg" alt="Template testimonial two" />
          </div>
          <div className="media-frame">
            <img src="/templates/testimonial-3.svg" alt="Template testimonial three" />
          </div>
        </div>
      </section>

    </div>
  );
}
