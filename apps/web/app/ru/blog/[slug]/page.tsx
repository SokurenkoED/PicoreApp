import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppEntryButton } from '@/components/app-entry-button';
import { BlogArticleContentView } from '@/components/blog-article-content';
import { fetchBlogArticleDetail, fetchBlogArticles } from '@/lib/api';

const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:8090';

function formatDate(date: string | null): string {
  if (!date) {
    return 'Без даты';
  }
  return new Date(date).toLocaleDateString('ru-RU', {
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
  const articles = await fetchBlogArticles('ru');
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await fetchBlogArticleDetail(params.slug, 'ru');
  if (!article) {
    return { title: 'Статья не найдена' };
  }

  const canonical = `${baseUrl}/ru/blog/${article.slug}`;
  const en = `${baseUrl}/blog/${article.slug}`;

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical,
      languages: {
        ru: canonical,
        en
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

export default async function RuBlogArticlePage({ params }: { params: { slug: string } }) {
  const article = await fetchBlogArticleDetail(params.slug, 'ru');
  if (!article) {
    notFound();
  }

  const published = formatDate(article.publishedAt);

  return (
    <article className="space-y-7">
      <header className="journal-card overflow-hidden">
        <div className="h-72 sm:h-96">
          <img src={article.coverImageUrl} alt={article.coverAlt || article.title} className="h-full w-full object-cover" />
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.11em] text-black/55">
            <span>{published}</span>
            <span>{article.readingMinutes} мин чтения</span>
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
        <h2 className="display text-3xl font-bold leading-tight">Примените этот workflow в следующей кампании</h2>
        <p className="mt-3 text-sm text-black/72 sm:text-base">
          Загружайте фото, генерируйте партиями и проверяйте результаты по чек-листу качества перед публикацией.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <AppEntryButton href="/ru/app" className="btn-secondary px-7 py-3.5 text-sm sm:text-base">
            Открыть генератор
          </AppEntryButton>
          <Link href="/ru/blog" className="btn-ghost px-7 py-3.5 text-sm sm:text-base">
            Назад в блог
          </Link>
        </div>
      </section>
    </article>
  );
}
