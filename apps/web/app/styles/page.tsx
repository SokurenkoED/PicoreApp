import type { Metadata } from 'next';
import { fetchPhotoshoots, fetchPresets, fetchStyles } from '@/lib/api';
import { StyleGrid } from '@/components/style-grid';
import { PresetPhotoshootGrid } from '@/components/preset-photoshoot-grid';

export const metadata: Metadata = {
  title: 'Styles',
  description: 'Catalog of AI photoshoot styles.'
};

export default async function StylesPage() {
  const [styles, presets, photoshoots] = await Promise.all([
    fetchStyles('en'),
    fetchPresets('en'),
    fetchPhotoshoots('en')
  ]);

  return (
    <div className="space-y-7">
      <section className="card p-6 sm:p-8">
        <span className="eyebrow">Style catalog</span>
        <h1 className="section-title mt-4">Choose a visual direction for your session</h1>
        <p className="section-subtitle mt-2">
          Each style page is SEO-ready and includes sample templates, FAQ and direct CTA into the generation flow.
        </p>
      </section>
      <StyleGrid items={styles} lang="en" />
      <PresetPhotoshootGrid lang="en" presets={presets} photoshoots={photoshoots} />
    </div>
  );
}
