import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppEntryButton } from '@/components/app-entry-button';
import { BlogArticleContentView } from '@/components/blog-article-content';
import { fetchBlogArticleDetail, fetchBlogArticles } from '@/lib/api';

const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:8090';

function formatDate(date: string | null, locale: 'en-US' | 'ru-RU'): string {
  if (!date) {
    return locale === 'ru-RU' ? 'No date' : 'No date';
  }
  return new Date(date).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function imageUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
}

export async function generateStaticParams() {
  const articles = await fetchBlogArticles('en');
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await fetchBlogArticleDetail(params.slug, 'en');
  if (!article) {
    return { title: 'Article not found' };
  }

  const canonical = `${baseUrl}/blog/${article.slug}`;
  const ru = `${baseUrl}/ru/blog/${article.slug}`;

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical,
      languages: {
        en: canonical,
        ru
      }
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: canonical,
      images: [imageUrl(article.coverImageUrl)]
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt
    }
  };
}

export default async function BlogArticlePage({ params }: { params: { slug: string } }) {
  const article = await fetchBlogArticleDetail(params.slug, 'en');
  if (!article) {
    notFound();
  }

  const published = formatDate(article.publishedAt, 'en-US');

  return (
    <article className="space-y-7">
      <header className="journal-card overflow-hidden">
        <div className="h-72 sm:h-96">
          <img src={article.coverImageUrl} alt={article.coverAlt || article.title} className="h-full w-full object-cover" />
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.11em] text-black/55">
            <span>{published}</span>
            <span>{article.readingMinutes} min read</span>
            <span>{article.authorName}</span>
          </div>
          <h1 className="display mt-4 text-4xl font-bold leading-tight sm:text-5xl">{article.title}</h1>
          <p className="mt-4 text-base text-black/75 sm:text-lg">{article.excerpt}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="journal-chip">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section className="journal-card p-6 sm:p-8">
        <BlogArticleContentView content={article.content} />
      </section>

      <section className="journal-card journal-grid-bg p-6 sm:p-8">
        <h2 className="display text-3xl font-bold leading-tight">Use this workflow in your next campaign</h2>
        <p className="mt-3 text-sm text-black/72 sm:text-base">
          Upload photos, run generation in batches and apply a consistent visual QA checklist before publishing.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <AppEntryButton href="/app" className="btn-secondary px-7 py-3.5 text-sm sm:text-base">
            Open generator
          </AppEntryButton>
          <Link href="/blog" className="btn-ghost px-7 py-3.5 text-sm sm:text-base">
            Back to blog
          </Link>
        </div>
      </section>
    </article>
  );
}
