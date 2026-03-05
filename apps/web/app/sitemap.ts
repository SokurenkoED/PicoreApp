import type { MetadataRoute } from 'next';
import { fetchBlogArticles, fetchStyles } from '@/lib/api';
import { enSectionPaths } from '@/lib/en-sections';

const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:8090';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const styles = await fetchStyles('en');
  const articles = await fetchBlogArticles('en');

  return [
    { url: `${baseUrl}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/styles`, changeFrequency: 'daily', priority: 0.9 },
    ...enSectionPaths.map((path) => ({
      url: `${baseUrl}${path}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8
    })),
    ...styles.map((style) => ({
      url: `${baseUrl}/style/${style.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8
    })),
    ...articles.map((article) => ({
      url: `${baseUrl}/blog/${article.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.75
    }))
  ];
}
