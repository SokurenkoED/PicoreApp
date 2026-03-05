import type { MetadataRoute } from 'next';

const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:8090';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/app', '/ru/app', '/ru/pay']
    },
    sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/ru/sitemap.xml`]
  };
}
