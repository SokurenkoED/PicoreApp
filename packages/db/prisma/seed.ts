import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const styles = [
  'corporate-headshots',
  'cinematic-portrait',
  'streetwear-editorial',
  'luxury-fashion',
  'wedding-classic',
  'fitness-pro',
  'tech-founder',
  'minimal-studio',
  'travel-lifestyle',
  'retro-film',
  'beauty-closeup',
  'dramatic-light'
].map((slug, idx) => ({
  slug,
  titleEn: slug.replaceAll('-', ' ').replace(/\b\w/g, (m) => m.toUpperCase()),
  titleRu: `Стиль ${idx + 1}`,
  descriptionEn: `AI photoshoot in ${slug.replaceAll('-', ' ')} style`,
  descriptionRu: `AI фотосессия в стиле ${idx + 1}`,
  faqEn: [
    { q: 'How many photos should I upload?', a: 'Upload 3-10 clear portraits.' },
    { q: 'How long does it take?', a: 'Usually 1-3 minutes in MVP.' }
  ],
  faqRu: [
    { q: 'Сколько фото загружать?', a: 'Загрузите 3-10 четких портретов.' },
    { q: 'Сколько ждать?', a: 'Обычно 1-3 минуты в MVP.' }
  ],
  sampleImages: [`/samples/${slug}-1.svg`, `/samples/${slug}-2.svg`],
  promptTemplate: { system: 'Generate professional portrait photoshoot' },
  defaultParams: { ratio: '4:5', quality: 'high' },
  isPublished: true
}));

const ruPackages = [
  { title: 'Starter 20', priceRub: 490, credits: 20, sort: 10 },
  { title: 'Pro 60', priceRub: 1290, credits: 60, sort: 20 },
  { title: 'Studio 150', priceRub: 2690, credits: 150, sort: 30 }
];

const generationModels = [
  {
    key: 'mock-v1',
    title: 'Mock Vision v1',
    description: 'Local mock provider for development',
    providerKey: 'mock',
    isActive: true
  },
  {
    key: 'http-proxy',
    title: 'HTTP Proxy Model',
    description: 'External provider through HTTP adapter',
    providerKey: 'http',
    isActive: true
  }
];

const presetSeeds = [
  {
    slug: 'editorial-clean',
    titleEn: 'Editorial Clean',
    titleRu: 'Редакционный чистый',
    descriptionEn: 'Clean light setup for commercial portraits.',
    descriptionRu: 'Чистая световая схема для коммерческих портретов.',
    promptTemplate: { system: 'Editorial portrait preset' },
    defaultParams: { ratio: '4:5', quality: 'high' },
    modelKey: 'mock-v1',
    isPublished: true
  },
  {
    slug: 'cinema-night',
    titleEn: 'Cinema Night',
    titleRu: 'Кино вечер',
    descriptionEn: 'Night-time cinematic look with color contrast.',
    descriptionRu: 'Кинематографичный ночной образ с контрастом цвета.',
    promptTemplate: { system: 'Night cinematic preset' },
    defaultParams: { ratio: '16:9', quality: 'high' },
    modelKey: 'http-proxy',
    isPublished: true
  }
];

const photoshootSeeds = [
  {
    slug: 'city-billboard-campaign',
    titleEn: 'City Billboard Campaign',
    titleRu: 'Городская рекламная кампания',
    descriptionEn: 'Outdoor campaign set with dramatic perspective.',
    descriptionRu: 'Набор кадров для наружной кампании с драматичной перспективой.',
    presetSlug: 'editorial-clean',
    modelKey: 'mock-v1',
    isPublished: true
  },
  {
    slug: 'studio-luxury-product',
    titleEn: 'Studio Luxury Product',
    titleRu: 'Студийный люкс продукт',
    descriptionEn: 'Controlled studio setup for premium visuals.',
    descriptionRu: 'Контролируемая студийная схема для премиального визуала.',
    presetSlug: 'cinema-night',
    modelKey: 'http-proxy',
    isPublished: true
  }
];

const demoArticle = {
  slug: 'ai-content-pipeline-for-monthly-campaigns',
  titleEn: 'AI Content Pipeline for Monthly Campaigns',
  titleRu: 'AI-конвейер контента для ежемесячных кампаний',
  excerptEn:
    'A practical system to generate, validate and publish a full month of visual materials in one cycle.',
  excerptRu:
    'Практическая система, как за один цикл сгенерировать, проверить и выпустить визуалы на месяц вперед.',
  contentEn: {
    format: 'blocks',
    blocks: [
      {
        type: 'p',
        text: 'Most teams lose speed between reference collection and final export. This framework builds a predictable loop where content is shipped weekly without quality drops.'
      },
      {
        type: 'h2',
        text: 'Step 1. Build a compact source library'
      },
      {
        type: 'p',
        text: 'Collect 15 to 20 references grouped by objective: awareness, trust and conversion. Keep visual language consistent before prompt work starts.'
      },
      {
        type: 'image',
        src: '/samples/tech-founder-2.svg',
        alt: 'Reference board for AI content planning',
        caption: 'A clean reference matrix by objective and channel.'
      },
      {
        type: 'h2',
        text: 'Step 2. Prepare two prompt lanes'
      },
      {
        type: 'ul',
        items: [
          'Lane A: stable conversion visuals with minimal variation.',
          'Lane B: exploratory visuals for weekly experimentation.',
          'Keep one QA checklist for both lanes to control quality.'
        ]
      },
      {
        type: 'quote',
        text: 'Treat prompts as production assets, not one-off text snippets.',
        cite: 'Picoria Editorial'
      },
      {
        type: 'h2',
        text: 'Step 3. Batch, review, publish'
      },
      {
        type: 'p',
        text: 'Run generation in batches, review by checklist, then export into a channel-ready calendar. This reduces chaos and aligns marketing with design.'
      }
    ]
  },
  contentRu: {
    format: 'blocks',
    blocks: [
      {
        type: 'p',
        text: 'Большинство команд теряет скорость между подбором референсов и финальным экспортом. Эта схема строит предсказуемый цикл, где контент выходит каждую неделю без просадки качества.'
      },
      {
        type: 'h2',
        text: 'Шаг 1. Соберите компактную библиотеку исходников'
      },
      {
        type: 'p',
        text: 'Соберите 15-20 референсов и разделите их по цели: охват, доверие, конверсия. Зафиксируйте единый визуальный язык до работы с промптами.'
      },
      {
        type: 'image',
        src: '/samples/tech-founder-2.svg',
        alt: 'Матрица референсов для контент-плана',
        caption: 'Референсы удобно группировать по целям и каналам.'
      },
      {
        type: 'h2',
        text: 'Шаг 2. Подготовьте две prompt-линии'
      },
      {
        type: 'ul',
        items: [
          'Линия A: стабильные конверсионные визуалы с минимумом вариаций.',
          'Линия B: экспериментальные визуалы для еженедельных тестов.',
          'Один чек-лист QA для обеих линий, чтобы держать качество.'
        ]
      },
      {
        type: 'quote',
        text: 'Относитесь к промптам как к продакшн-активам, а не как к разовым текстам.',
        cite: 'Редакция Picoria'
      },
      {
        type: 'h2',
        text: 'Шаг 3. Пакетная генерация, проверка, публикация'
      },
      {
        type: 'p',
        text: 'Генерируйте партиями, проверяйте по чек-листу и переносите результаты в календарь публикаций. Так маркетинг и дизайн начинают работать в одном ритме.'
      }
    ]
  },
  coverImageUrl: '/samples/cinematic-portrait-1.svg',
  coverAltEn: 'AI content planning dashboard',
  coverAltRu: 'Панель планирования AI-контента',
  tagsEn: ['AI Content', 'Workflow', 'Marketing'],
  tagsRu: ['AI-контент', 'Workflow', 'Маркетинг'],
  authorName: 'Picoria Editorial',
  readingMinutes: 7,
  isPublished: true,
  publishedAt: new Date('2026-02-20T09:00:00.000Z')
};

async function main(): Promise<void> {
  for (const style of styles) {
    await prisma.style.upsert({
      where: { slug: style.slug },
      create: style,
      update: style
    });
  }

  for (const item of ruPackages) {
    await prisma.package.upsert({
      where: { id: `00000000-0000-0000-0000-${String(item.sort).padStart(12, '0')}` },
      create: {
        id: `00000000-0000-0000-0000-${String(item.sort).padStart(12, '0')}`,
        ...item,
        isActive: true
      },
      update: {
        ...item,
        isActive: true
      }
    });
  }

  for (const model of generationModels) {
    await prisma.generationModel.upsert({
      where: { key: model.key },
      create: model,
      update: model
    });
  }

  const models = await prisma.generationModel.findMany();
  const modelByKey = new Map(models.map((item) => [item.key, item]));

  for (const preset of presetSeeds) {
    const model = modelByKey.get(preset.modelKey);
    await prisma.preset.upsert({
      where: { slug: preset.slug },
      create: {
        slug: preset.slug,
        titleEn: preset.titleEn,
        titleRu: preset.titleRu,
        descriptionEn: preset.descriptionEn,
        descriptionRu: preset.descriptionRu,
        promptTemplate: preset.promptTemplate,
        defaultParams: preset.defaultParams,
        coverAssetKey: null,
        sampleAssetKeys: [],
        modelId: model?.id ?? null,
        isPublished: preset.isPublished
      },
      update: {
        titleEn: preset.titleEn,
        titleRu: preset.titleRu,
        descriptionEn: preset.descriptionEn,
        descriptionRu: preset.descriptionRu,
        promptTemplate: preset.promptTemplate,
        defaultParams: preset.defaultParams,
        modelId: model?.id ?? null,
        isPublished: preset.isPublished
      }
    });
  }

  const presets = await prisma.preset.findMany();
  const presetBySlug = new Map(presets.map((item) => [item.slug, item]));

  for (const photoshoot of photoshootSeeds) {
    const model = modelByKey.get(photoshoot.modelKey);
    const preset = presetBySlug.get(photoshoot.presetSlug);
    await prisma.photoshoot.upsert({
      where: { slug: photoshoot.slug },
      create: {
        slug: photoshoot.slug,
        titleEn: photoshoot.titleEn,
        titleRu: photoshoot.titleRu,
        descriptionEn: photoshoot.descriptionEn,
        descriptionRu: photoshoot.descriptionRu,
        coverAssetKey: null,
        galleryAssetKeys: [],
        presetId: preset?.id ?? null,
        modelId: model?.id ?? null,
        isPublished: photoshoot.isPublished
      },
      update: {
        titleEn: photoshoot.titleEn,
        titleRu: photoshoot.titleRu,
        descriptionEn: photoshoot.descriptionEn,
        descriptionRu: photoshoot.descriptionRu,
        presetId: preset?.id ?? null,
        modelId: model?.id ?? null,
        isPublished: photoshoot.isPublished
      }
    });
  }

  await prisma.blogArticle.upsert({
    where: { slug: demoArticle.slug },
    create: demoArticle,
    update: demoArticle
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
