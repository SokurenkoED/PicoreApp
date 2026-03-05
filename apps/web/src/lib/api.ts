import type {
  BlogArticleDetail,
  BlogArticleListItem,
  PhotoshootListItem,
  PresetDetail,
  PresetListItem,
  StyleDetail,
  StyleListItem
} from '@/types/api';

const INTERNAL_API_BASE_URL = process.env.INTERNAL_API_BASE_URL ?? 'http://localhost:3001/api';

export async function fetchStyles(lang: 'en' | 'ru'): Promise<StyleListItem[]> {
  const response = await fetch(`${INTERNAL_API_BASE_URL}/styles?lang=${lang}`, {
    cache: 'no-store'
  });
  if (!response.ok) {
    return [];
  }
  return response.json() as Promise<StyleListItem[]>;
}

export async function fetchStyleDetail(
  slug: string,
  lang: 'en' | 'ru'
): Promise<StyleDetail | null> {
  const response = await fetch(`${INTERNAL_API_BASE_URL}/styles/${slug}?lang=${lang}`, {
    cache: 'no-store'
  });
  if (!response.ok) {
    return null;
  }
  return response.json() as Promise<StyleDetail>;
}

export async function fetchPresets(lang: 'en' | 'ru'): Promise<PresetListItem[]> {
  const response = await fetch(`${INTERNAL_API_BASE_URL}/presets?lang=${lang}`, {
    cache: 'no-store'
  });
  if (!response.ok) {
    return [];
  }
  return response.json() as Promise<PresetListItem[]>;
}

export async function fetchPresetDetail(
  slug: string,
  lang: 'en' | 'ru'
): Promise<PresetDetail | null> {
  const response = await fetch(`${INTERNAL_API_BASE_URL}/presets/${slug}?lang=${lang}`, {
    cache: 'no-store'
  });
  if (!response.ok) {
    return null;
  }
  return response.json() as Promise<PresetDetail>;
}

export async function fetchPhotoshoots(lang: 'en' | 'ru'): Promise<PhotoshootListItem[]> {
  const response = await fetch(`${INTERNAL_API_BASE_URL}/photoshoots?lang=${lang}`, {
    cache: 'no-store'
  });
  if (!response.ok) {
    return [];
  }
  return response.json() as Promise<PhotoshootListItem[]>;
}

export async function fetchBlogArticles(lang: 'en' | 'ru'): Promise<BlogArticleListItem[]> {
  const response = await fetch(`${INTERNAL_API_BASE_URL}/blog/articles?lang=${lang}`, {
    next: { revalidate: 120 }
  });
  if (!response.ok) {
    return [];
  }
  return response.json() as Promise<BlogArticleListItem[]>;
}

export async function fetchBlogArticleDetail(
  slug: string,
  lang: 'en' | 'ru'
): Promise<BlogArticleDetail | null> {
  const response = await fetch(`${INTERNAL_API_BASE_URL}/blog/articles/${slug}?lang=${lang}`, {
    next: { revalidate: 120 }
  });
  if (!response.ok) {
    return null;
  }
  return response.json() as Promise<BlogArticleDetail>;
}
