import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PresetStudioClient } from '@/components/preset-studio-client';
import { fetchPresetDetail } from '@/lib/api';

const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:8090';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const preset = await fetchPresetDetail(params.slug, 'ru');
  if (!preset) {
    return { title: 'Пресет не найден' };
  }

  const canonical = `${baseUrl}/ru/preset/${preset.slug}`;
  const en = `${baseUrl}/preset/${preset.slug}`;

  return {
    title: `${preset.title} пресет`,
    description: preset.description,
    alternates: {
      canonical,
      languages: {
        ru: canonical,
        en
      }
    },
    openGraph: {
      title: `${preset.title} пресет`,
      description: preset.description,
      url: canonical,
      images: preset.coverImage ? [`${baseUrl}${preset.coverImage}`] : undefined
    }
  };
}

export default async function RuPresetPage({ params }: { params: { slug: string } }) {
  const preset = await fetchPresetDetail(params.slug, 'ru');
  if (!preset) {
    notFound();
  }

  return <PresetStudioClient lang="ru" preset={preset} />;
}
