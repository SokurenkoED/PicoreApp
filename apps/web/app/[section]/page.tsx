import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppEntryButton } from '@/components/app-entry-button';
import { BlogSectionPage } from '@/components/blog-section-page';
import { fetchBlogArticles } from '@/lib/api';
import { enSections, getEnSectionBySlug } from '@/lib/en-sections';

type SectionPageProps = {
  params: {
    section: string;
  };
};

export function generateStaticParams() {
  return enSections.map((item) => ({ section: item.slug }));
}

export const dynamicParams = false;

export function generateMetadata({ params }: SectionPageProps): Metadata {
  const section = getEnSectionBySlug(params.section);

  if (!section) {
    return {
      title: 'Section not found',
      description: 'Requested section does not exist.'
    };
  }

  return {
    title: section.pageTitle,
    description: section.pageDescription,
    alternates: {
      canonical: section.href
    }
  };
}

export default async function EnSectionPage({ params }: SectionPageProps) {
  const section = getEnSectionBySlug(params.section);

  if (!section) {
    notFound();
  }

  if (section.slug === 'blog') {
    const articles = await fetchBlogArticles('en');
    return <BlogSectionPage locale="en" section={section} featuredArticle={articles[0]} />;
  }

  const primaryAction = section.slug === 'partnerships' ? 'Discuss partnership' : 'Try for free';
  const secondaryAction = section.slug === 'faq' ? 'Open app' : 'Browse styles';
  const secondaryHref = section.slug === 'faq' ? '/app' : '/styles';

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="card reveal relative overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#6578ff]/16 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#53c2ff]/12 blur-3xl" />
        <div className="relative">
          <span className="eyebrow">Picoria section</span>
          <h1 className="display mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">{section.heroTitle}</h1>
          <p className="mt-4 max-w-3xl text-base text-black/75 sm:text-lg">{section.heroLead}</p>
          <p className="mt-4 max-w-3xl text-sm text-black/65 sm:text-base">{section.seoLead}</p>

          <div className="mt-7 flex flex-wrap gap-3">
            <AppEntryButton href="/app" className="btn-cta px-7 py-3.5 text-sm sm:text-base">
              {primaryAction}
            </AppEntryButton>
            <Link href={secondaryHref} className="btn-ghost px-7 py-3.5 text-sm sm:text-base">
              {secondaryAction}
            </Link>
          </div>
        </div>
      </section>

      <section className="reveal space-y-4">
        <div>
          <span className="eyebrow">Core value</span>
          <h2 className="section-title mt-3">What you get in this section</h2>
        </div>
        <div className="stagger grid gap-4 md:grid-cols-3">
          {section.outcomes.map((outcome) => (
            <article key={outcome} className="card p-5">
              <p className="text-base text-black/80">{outcome}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="reveal space-y-4">
        <div>
          <span className="eyebrow">Examples</span>
          <h2 className="section-title mt-3">Collections and scenarios</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {section.examples.map((example) => (
            <article key={example.title} className="media-frame overflow-hidden">
              <img src={example.image} alt={example.title} className="h-64 w-full object-cover" />
              <div className="border-t px-4 py-4" style={{ borderColor: 'var(--line)' }}>
                <h3 className="display text-2xl font-bold leading-tight">{example.title}</h3>
                <p className="mt-2 text-sm text-black/70">{example.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="reveal space-y-4 pb-2">
        <div>
          <span className="eyebrow">FAQ</span>
          <h2 className="section-title mt-3">Answers to common questions</h2>
        </div>
        <div className="stagger grid gap-4 md:grid-cols-3">
          {section.faqs.map((faq) => (
            <article key={faq.question} className="card p-5">
              <h3 className="display text-xl font-bold leading-tight">{faq.question}</h3>
              <p className="mt-3 text-sm text-black/70">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card reveal p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="eyebrow">Next step</span>
            <h2 className="section-title mt-3">Launch your first generation now</h2>
            <p className="section-subtitle mt-2">
              Test a scenario on your own photos and get results in just a few minutes.
            </p>
          </div>
          <AppEntryButton href="/app" className="btn-secondary px-7 py-3.5 text-sm sm:text-base">
            Open generator
          </AppEntryButton>
        </div>
      </section>
    </div>
  );
}
