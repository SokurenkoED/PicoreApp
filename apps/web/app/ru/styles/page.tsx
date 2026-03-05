import type { Metadata } from 'next';
import { fetchPhotoshoots, fetchPresets, fetchStyles } from '@/lib/api';
import { StyleGrid } from '@/components/style-grid';
import { PresetPhotoshootGrid } from '@/components/preset-photoshoot-grid';

export const metadata: Metadata = {
  title: 'Стили',
  description: 'Каталог стилей AI фотосессий.'
};

export default async function RuStylesPage() {
  const [styles, presets, photoshoots] = await Promise.all([
    fetchStyles('ru'),
    fetchPresets('ru'),
    fetchPhotoshoots('ru')
  ]);

  return (
    <div className="space-y-7">
      <section className="card p-6 sm:p-8">
        <span className="eyebrow">Каталог стилей</span>
        <h1 className="section-title mt-4">Выберите визуальную подачу фотосессии</h1>
        <p className="section-subtitle mt-2">
          Страницы стилей оптимизированы под SEO: примеры, FAQ и переход в генерацию одним кликом.
        </p>
      </section>
      <StyleGrid items={styles} lang="ru" />
      <PresetPhotoshootGrid lang="ru" presets={presets} photoshoots={photoshoots} />
    </div>
  );
}
