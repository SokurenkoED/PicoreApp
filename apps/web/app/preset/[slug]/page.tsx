import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PresetStudioClient } from '@/components/preset-studio-client';
import { fetchPresetDetail } from '@/lib/api';

const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:8090';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const preset = await fetchPresetDetail(params.slug, 'en');
  if (!preset) {
    return { title: 'Preset not found' };
  }

  const canonical = `${baseUrl}/preset/${preset.slug}`;
  const ru = `${baseUrl}/ru/preset/${preset.slug}`;

  return {
    title: `${preset.title} Preset`,
    description: preset.description,
    alternates: {
      canonical,
      languages: {
        en: canonical,
        ru
      }
    },
    openGraph: {
      title: `${preset.title} Preset`,
      description: preset.description,
      url: canonical,
      images: preset.coverImage ? [`${baseUrl}${preset.coverImage}`] : undefined
    }
  };
}

export default async function PresetPage({ params }: { params: { slug: string } }) {
  const preset = await fetchPresetDetail(params.slug, 'en');
  if (!preset) {
    notFound();
  }

  return <PresetStudioClient lang="en" preset={preset} />;
}
