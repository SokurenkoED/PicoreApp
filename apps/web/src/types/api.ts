export interface StyleListItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  sampleImages: string[];
}

export interface StyleDetail extends StyleListItem {
  faq: Array<{ q: string; a: string }>;
  defaultParams: Record<string, unknown>;
}

export interface PresetListItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  modelKey: string | null;
  modelTitle: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  coverImage: string | null;
  sampleImages: string[];
}

export interface PhotoshootListItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  modelKey: string | null;
  modelTitle: string | null;
  presetSlug: string | null;
  presetTitle: string | null;
  coverImage: string | null;
  galleryImages: string[];
}

export type BlogContentBlock =
  | { type: 'h2' | 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'ul'; items: string[] }
  | { type: 'image'; src: string; alt: string; caption?: string };

export type BlogArticleContent =
  | { format: 'html'; html: string }
  | { format: 'blocks'; blocks: BlogContentBlock[] };

export interface BlogArticleListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  coverAlt: string;
  tags: string[];
  authorName: string;
  readingMinutes: number;
  publishedAt: string | null;
}

export interface BlogArticleDetail extends BlogArticleListItem {
  content: BlogArticleContent;
}

export interface MeResponse {
  id: string;
  type: 'guest' | 'telegram' | 'local' | 'vk' | 'yandex';
  role: 'user' | 'admin';
  locale: 'en' | 'ru';
  email: string | null;
  name: string | null;
  balance: number | null;
  remainingFreeAttempts: number | null;
}
