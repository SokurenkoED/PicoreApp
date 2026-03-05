import { fetchBlogArticles, fetchPresets, fetchStyles } from '@/lib/api';
import { ruSectionPaths } from '@/lib/ru-sections';

const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:8090';

export async function GET() {
  const [styles, presets, articles] = await Promise.all([
    fetchStyles('ru'),
    fetchPresets('ru'),
    fetchBlogArticles('ru')
  ]);

  const urls = [
    `${baseUrl}/ru`,
    `${baseUrl}/ru/styles`,
    ...ruSectionPaths.map((path) => `${baseUrl}${path}`),
    ...styles.map((style) => `${baseUrl}/ru/style/${style.slug}`),
    ...presets.map((preset) => `${baseUrl}/ru/preset/${preset.slug}`),
    ...articles.map((article) => `${baseUrl}/ru/blog/${article.slug}`)
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((url) => `<url><loc>${url}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`)
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
}
