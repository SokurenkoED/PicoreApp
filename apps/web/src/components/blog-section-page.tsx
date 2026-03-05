import Link from 'next/link';

type BlogSectionLocale = 'en' | 'ru';

type BlogExample = {
  image: string;
  title: string;
  description: string;
};

type BlogFaq = {
  question: string;
  answer: string;
};

type BlogSectionData = {
  href: string;
  heroTitle: string;
  heroLead: string;
  seoLead: string;
  outcomes: string[];
  examples: BlogExample[];
  faqs: BlogFaq[];
};

type FeaturedBlogArticle = {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  publishedAt: string | null;
  readingMinutes: number;
  authorName: string;
};

type FeedCard = {
  title: string;
  description: string;
  image: string;
  tag: string;
  date: string;
  views: string;
  comments: string;
  href: string;
};

type UpdateItem = {
  tag: string;
  title: string;
  metric: string;
  href: string;
};

type CollectionItem = {
  title: string;
  description: string;
  href: string;
};

type JournalNavigatorCard = {
  title: string;
  description: string;
  stat: string;
  statLabel: string;
  href: string;
  accent?: boolean;
};

type LocaleCopy = {
  topLabel: string;
  topTopics: string[];
  topMore: string;
  topMoreHref: string;
  heroBadge: string;
  heroPrimary: string;
  heroSecondary: string;
  heroSecondaryHref: string;
  metricsTitle: string;
  metrics: Array<{ label: string; value: string }>;
  localeSwitch: string;
  localeSwitchHref: string;
  featuredTag: string;
  featuredDate: string;
  featuredViews: string;
  featuredComments: string;
  featuredAction: string;
  updatesTitle: string;
  updatesLead: string;
  updatesMore: string;
  updates: UpdateItem[];
  discussedTitle: string;
  discussedStats: string[];
  guideTitle: string;
  guideItems: string[];
  navigatorTitle: string;
  navigatorLead: string;
  navigatorTabs: string[];
  navigatorAction: string;
  navigatorActionHref: string;
  navigatorCards: JournalNavigatorCard[];
  feedTitle: string;
  feedLead: string;
  feedAction: string;
  collectionsTitle: string;
  collections: CollectionItem[];
  newsletterTitle: string;
  newsletterLead: string;
  newsletterButton: string;
  faqTitle: string;
  faqLead: string;
};

const localeCopy: Record<BlogSectionLocale, LocaleCopy> = {
  en: {
    topLabel: 'Trending topics',
    topTopics: [
      'AI content',
      'Growth',
      'Performance ads',
      'Brand visuals',
      'Experiments',
      'Case studies',
      'Automation',
      'Funnel design'
    ],
    topMore: 'All topics',
    topMoreHref: '/styles',
    heroBadge: 'Editorial',
    heroPrimary: 'Open generator',
    heroSecondary: 'Style catalog',
    heroSecondaryHref: '/styles',
    metricsTitle: 'Today in Picoria Blog',
    metrics: [
      { label: 'New posts this week', value: '12' },
      { label: 'Average read', value: '6 min' },
      { label: 'Ready playbooks', value: '24' }
    ],
    localeSwitch: 'Read in Russian',
    localeSwitchHref: '/ru/blog',
    featuredTag: 'Featured',
    featuredDate: 'Feb 23',
    featuredViews: '14K',
    featuredComments: '126',
    featuredAction: 'Read article',
    updatesTitle: 'News and updates',
    updatesLead: 'Quick notes, releases and platform changes.',
    updatesMore: 'More updates',
    updates: [
      {
        tag: 'Release',
        title: 'New prompt presets for studio portraits',
        metric: '2h ago',
        href: '/app'
      },
      {
        tag: 'How-to',
        title: 'How to standardize visuals for a content team',
        metric: '5h ago',
        href: '/styles'
      },
      {
        tag: 'Research',
        title: 'What image angles increase profile clicks',
        metric: 'Yesterday',
        href: '/styles'
      },
      {
        tag: 'Checklist',
        title: 'From references to final export in one flow',
        metric: 'Yesterday',
        href: '/app'
      },
      {
        tag: 'Benchmark',
        title: 'Comparing conversion-ready cover styles',
        metric: '2 days ago',
        href: '/styles'
      }
    ],
    discussedTitle: 'Most discussed',
    discussedStats: ['328 comments', '214 comments', '167 comments'],
    guideTitle: 'Guide cards',
    guideItems: [
      'How to build monthly visual plans',
      'Visual QA checklist before launch',
      'Editorial vs commercial style match',
      'Templates for creator funnels',
      'Fast creative testing loop'
    ],
    navigatorTitle: 'Journal navigator',
    navigatorLead: 'Choose a stream and jump straight to curated editorial tracks.',
    navigatorTabs: ['How-to', 'Research', 'Case studies', 'Editorial picks', 'Templates', 'Workflows'],
    navigatorAction: 'Open all streams',
    navigatorActionHref: '/styles',
    navigatorCards: [
      {
        title: 'Content System',
        description: 'Weekly frameworks for predictable visual output and publishing rhythm.',
        stat: '32',
        statLabel: 'Guides',
        href: '/styles',
        accent: true
      },
      {
        title: 'Conversion Lab',
        description: 'Practical experiments on covers, hooks and ad-ready visual structure.',
        stat: '18',
        statLabel: 'Experiments',
        href: '/app'
      },
      {
        title: 'Creator Desk',
        description: 'Editorial notes for experts, creators and personal-brand positioning.',
        stat: '41',
        statLabel: 'Articles',
        href: '/styles'
      },
      {
        title: 'Team Ops',
        description: 'Production operations, QA templates and generation hand-off routines.',
        stat: '27',
        statLabel: 'Playbooks',
        href: '/app'
      }
    ],
    feedTitle: 'Latest from the editorial stream',
    feedLead: 'Structured feed with practical guides, experiments and visual strategy notes.',
    feedAction: 'Open app',
    collectionsTitle: 'What else to read',
    collections: [
      {
        title: 'Conversion-centered visuals',
        description: 'Principles for landing pages, social ads and creator funnels.',
        href: '/styles'
      },
      {
        title: 'AI photos for experts',
        description: 'Positioning frameworks for consultants and education products.',
        href: '/app'
      },
      {
        title: 'Team production workflows',
        description: 'Hand-off, QA and batch generation best practices.',
        href: '/app'
      },
      {
        title: 'Prompt and style systems',
        description: 'How to scale quality while preserving brand consistency.',
        href: '/styles'
      }
    ],
    newsletterTitle: 'Get a weekly visual strategy digest',
    newsletterLead: 'One short issue with practical methods, no generic trend noise.',
    newsletterButton: 'Start with free styles',
    faqTitle: 'FAQ',
    faqLead: 'Fast answers before launch.'
  },
  ru: {
    topLabel: 'Популярные темы',
    topTopics: [
      'AI-контент',
      'Маркетинг',
      'Перфоманс',
      'Бренд-визуал',
      'Эксперименты',
      'Кейсы',
      'Автоматизация',
      'Воронки'
    ],
    topMore: 'Все темы',
    topMoreHref: '/ru/styles',
    heroBadge: 'Редакция',
    heroPrimary: 'Открыть генератор',
    heroSecondary: 'Каталог стилей',
    heroSecondaryHref: '/ru/styles',
    metricsTitle: 'Сегодня в блоге Picoria',
    metrics: [
      { label: 'Новых материалов за неделю', value: '12' },
      { label: 'Среднее чтение', value: '6 мин' },
      { label: 'Готовых playbook', value: '24' }
    ],
    localeSwitch: 'Read in English',
    localeSwitchHref: '/blog',
    featuredTag: 'Главное',
    featuredDate: '23 фев',
    featuredViews: '14K',
    featuredComments: '126',
    featuredAction: 'Читать материал',
    updatesTitle: 'Новости и обновления',
    updatesLead: 'Короткие заметки о релизах и рабочих подходах.',
    updatesMore: 'Больше обновлений',
    updates: [
      {
        tag: 'Релиз',
        title: 'Новые prompt-пресеты для студийных портретов',
        metric: '2 ч назад',
        href: '/ru/app'
      },
      {
        tag: 'Гайд',
        title: 'Как стандартизировать визуалы для контент-команды',
        metric: '5 ч назад',
        href: '/ru/styles'
      },
      {
        tag: 'Исследование',
        title: 'Какие ракурсы повышают кликабельность профиля',
        metric: 'Вчера',
        href: '/ru/styles'
      },
      {
        tag: 'Чек-лист',
        title: 'От референсов до экспорта за один цикл',
        metric: 'Вчера',
        href: '/ru/app'
      },
      {
        tag: 'Бенчмарк',
        title: 'Сравнение обложек по конверсионному потенциалу',
        metric: '2 дня назад',
        href: '/ru/styles'
      }
    ],
    discussedTitle: 'Самое обсуждаемое',
    discussedStats: ['328 комментариев', '214 комментариев', '167 комментариев'],
    guideTitle: 'Учебник',
    guideItems: [
      'Как собрать контент-план на месяц',
      'Чек-лист визуального QA перед запуском',
      'Как сочетать editorial и коммерческий стиль',
      'Шаблоны для экспертных воронок',
      'Быстрые циклы тестирования креативов'
    ],
    navigatorTitle: 'Навигатор журнала',
    navigatorLead: 'Выберите поток и переходите в готовые редакционные подборки.',
    navigatorTabs: ['Гайды', 'Исследования', 'Кейсы', 'Выбор редакции', 'Шаблоны', 'Операционка'],
    navigatorAction: 'Открыть все потоки',
    navigatorActionHref: '/ru/styles',
    navigatorCards: [
      {
        title: 'Контент-система',
        description: 'Еженедельные схемы для стабильного выпуска визуального контента.',
        stat: '32',
        statLabel: 'Гайда',
        href: '/ru/styles',
        accent: true
      },
      {
        title: 'Лаборатория конверсии',
        description: 'Тесты обложек, хуков и структуры креативов под performance-задачи.',
        stat: '18',
        statLabel: 'Экспериментов',
        href: '/ru/app'
      },
      {
        title: 'Редакция эксперта',
        description: 'Материалы для экспертов, авторов курсов и персонального бренда.',
        stat: '41',
        statLabel: 'Статья',
        href: '/ru/styles'
      },
      {
        title: 'Командная операционка',
        description: 'Workflow, шаблоны QA и передача задач между ролями в команде.',
        stat: '27',
        statLabel: 'Playbook',
        href: '/ru/app'
      }
    ],
    feedTitle: 'Свежие материалы редакционного потока',
    feedLead: 'Плотная лента с практикой, тестами и решениями для визуальной стратегии.',
    feedAction: 'Открыть приложение',
    collectionsTitle: 'Что еще почитать',
    collections: [
      {
        title: 'Визуалы для роста конверсии',
        description: 'Подходы для лендингов, соцсетей и рекламных кампаний.',
        href: '/ru/styles'
      },
      {
        title: 'AI-фото для экспертов',
        description: 'Фреймворки позиционирования для образовательных и консалтинговых продуктов.',
        href: '/ru/app'
      },
      {
        title: 'Командные workflows',
        description: 'Как организовать hand-off, QA и batch-генерацию.',
        href: '/ru/app'
      },
      {
        title: 'Системы стилей и prompt-логика',
        description: 'Масштабирование качества без потери единого бренд-языка.',
        href: '/ru/styles'
      }
    ],
    newsletterTitle: 'Получайте еженедельный дайджест по визуальной стратегии',
    newsletterLead: 'Коротко и по делу: только рабочие схемы без информационного шума.',
    newsletterButton: 'Начать с бесплатных стилей',
    faqTitle: 'FAQ',
    faqLead: 'Короткие ответы перед стартом.'
  }
};

function buildFeedCards(locale: BlogSectionLocale, section: BlogSectionData): FeedCard[] {
  const appHref = locale === 'ru' ? '/ru/app' : '/app';
  const stylesHref = locale === 'ru' ? '/ru/styles' : '/styles';

  const exampleCards = section.examples.map((item, index) => ({
    title: item.title,
    description: item.description,
    image: item.image,
    tag:
      locale === 'ru'
        ? ['Разбор', 'Практика', 'Кейс', 'Тренд'][index] ?? 'Материал'
        : ['Explainer', 'Playbook', 'Case study', 'Trend'][index] ?? 'Article',
    date: locale === 'ru' ? ['23 фев', '22 фев', '21 фев', '20 фев'][index] ?? '19 фев' : ['Feb 23', 'Feb 22', 'Feb 21', 'Feb 20'][index] ?? 'Feb 19',
    views: ['14K', '9K', '7K', '6K'][index] ?? '4K',
    comments: ['126', '84', '61', '49'][index] ?? '37',
    href: section.href
  }));

  const extraCards: FeedCard[] =
    locale === 'ru'
      ? [
          {
            title: 'Как проверить, что визуальная серия готова к публикации',
            description: 'Собрали короткий контрольный список для маркетолога и дизайнера.',
            image: '/samples/corporate-headshots-1.svg',
            tag: 'Чек-лист',
            date: '19 фев',
            views: '5K',
            comments: '42',
            href: appHref
          },
          {
            title: 'Пакетная генерация: как ускорить выпуск контента',
            description: 'Методика для команд, где нужен ритм публикаций без просадки качества.',
            image: '/samples/travel-lifestyle-2.svg',
            tag: 'Операционка',
            date: '18 фев',
            views: '4K',
            comments: '31',
            href: appHref
          },
          {
            title: 'Какие визуальные форматы лучше заходят в экспертном Telegram',
            description: 'Сопоставили форматы, структуру обложек и удержание по типам постов.',
            image: '/samples/tech-founder-1.svg',
            tag: 'Аналитика',
            date: '17 фев',
            views: '6K',
            comments: '57',
            href: stylesHref
          },
          {
            title: 'Как не терять единый бренд-стиль при росте команды',
            description: 'Рабочая схема для синхронизации копирайтера, маркетолога и дизайнера.',
            image: '/samples/minimal-studio-2.svg',
            tag: 'Система',
            date: '16 фев',
            views: '3K',
            comments: '24',
            href: stylesHref
          }
        ]
      : [
          {
            title: 'Pre-publish checklist for high-converting visual batches',
            description: 'A compact quality framework for marketing and design teams.',
            image: '/samples/corporate-headshots-1.svg',
            tag: 'Checklist',
            date: 'Feb 19',
            views: '5K',
            comments: '42',
            href: appHref
          },
          {
            title: 'Batch generation: how to ship visual content faster',
            description: 'A repeatable process for teams with weekly content commitments.',
            image: '/samples/travel-lifestyle-2.svg',
            tag: 'Operations',
            date: 'Feb 18',
            views: '4K',
            comments: '31',
            href: appHref
          },
          {
            title: 'What visual formats work best for expert-led Telegram channels',
            description: 'A practical breakdown of hooks, covers and retention signals.',
            image: '/samples/tech-founder-1.svg',
            tag: 'Analytics',
            date: 'Feb 17',
            views: '6K',
            comments: '57',
            href: stylesHref
          },
          {
            title: 'Preserving visual consistency while scaling your team',
            description: 'A framework for aligned work between copy, design and growth.',
            image: '/samples/minimal-studio-2.svg',
            tag: 'System design',
            date: 'Feb 16',
            views: '3K',
            comments: '24',
            href: stylesHref
          }
        ];

  return [...exampleCards, ...extraCards];
}

function formatFeaturedMeta(date: string | null, locale: BlogSectionLocale): string {
  if (!date) {
    return locale === 'ru' ? 'Без даты' : 'No date';
  }

  return new Date(date).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
    day: '2-digit',
    month: 'short'
  });
}

export function BlogSectionPage({
  locale,
  section,
  featuredArticle
}: {
  locale: BlogSectionLocale;
  section: BlogSectionData;
  featuredArticle?: FeaturedBlogArticle;
}) {
  const copy = localeCopy[locale];
  const feedCards = buildFeedCards(locale, section);
  const appHref = locale === 'ru' ? '/ru/app' : '/app';
  const blogBaseHref = locale === 'ru' ? '/ru/blog' : '/blog';
  const fallbackExample = section.examples[0] ?? {
    image: '/templates/hero-shot-1.svg',
    title: locale === 'ru' ? 'Материал недели' : 'Story of the week',
    description: locale === 'ru' ? 'Ключевой разбор недели' : 'Editorial highlight'
  };
  const featuredHref = featuredArticle ? `${blogBaseHref}/${featuredArticle.slug}` : section.href;
  const featuredImage = featuredArticle?.coverImageUrl ?? fallbackExample.image;
  const featuredTitle = featuredArticle?.title ?? fallbackExample.title;
  const featuredDescription = featuredArticle?.excerpt ?? fallbackExample.description;
  const featuredDate = featuredArticle ? formatFeaturedMeta(featuredArticle.publishedAt, locale) : copy.featuredDate;
  const featuredViews = featuredArticle
    ? locale === 'ru'
      ? `${featuredArticle.readingMinutes} мин`
      : `${featuredArticle.readingMinutes} min`
    : copy.featuredViews;
  const featuredComments = featuredArticle?.authorName ?? copy.featuredComments;

  return (
    <div className="journal-shell space-y-8 sm:space-y-10">
      <section className="journal-card reveal p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="journal-kicker">{copy.topLabel}</span>
          {copy.topTopics.map((topic) => (
            <Link key={topic} href={copy.topMoreHref} className="journal-chip">
              {topic}
            </Link>
          ))}
          <Link href={copy.topMoreHref} className="journal-chip journal-chip-accent ml-auto">
            {copy.topMore}
          </Link>
        </div>
      </section>

      <section className="reveal grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(250px,0.75fr)]">
        <article className="journal-card journal-grid-bg overflow-hidden p-6 sm:p-8">
          <span className="journal-highlight">{copy.heroBadge}</span>
          <h1 className="display mt-4 text-4xl font-bold leading-tight sm:text-5xl">{section.heroTitle}</h1>
          <p className="mt-4 max-w-3xl text-base text-black/75 sm:text-lg">{section.heroLead}</p>
          <p className="mt-4 max-w-3xl text-sm text-black/65 sm:text-base">{section.seoLead}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={appHref} className="btn-secondary px-7 py-3.5 text-sm sm:text-base">
              {copy.heroPrimary}
            </Link>
            <Link href={copy.heroSecondaryHref} className="btn-ghost px-7 py-3.5 text-sm sm:text-base">
              {copy.heroSecondary}
            </Link>
          </div>
        </article>

        <aside className="journal-card p-5 sm:p-6">
          <p className="journal-kicker">{copy.metricsTitle}</p>
          <div className="mt-4 space-y-3">
            {copy.metrics.map((item) => (
              <div key={item.label} className="rounded-2xl border bg-white px-4 py-3" style={{ borderColor: 'var(--line)' }}>
                <p className="text-xs uppercase tracking-[0.12em] text-black/55">{item.label}</p>
                <p className="display mt-1 text-2xl font-bold text-[#141b22]">{item.value}</p>
              </div>
            ))}
          </div>
          <Link href={copy.localeSwitchHref} className="mt-4 inline-flex text-sm font-semibold text-[#0a4757] hover:text-[#073946]">
            {copy.localeSwitch}
          </Link>
        </aside>
      </section>

      <section className="reveal grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
        <article className="journal-card overflow-hidden">
          <Link href={featuredHref}>
            <div className="h-72 w-full sm:h-80">
              <img src={featuredImage} alt={featuredTitle} className="h-full w-full object-cover" />
            </div>
            <div className="p-5 sm:p-6">
              <span className="journal-highlight">{copy.featuredTag}</span>
              <h2 className="display mt-3 text-3xl font-bold leading-tight sm:text-4xl">{featuredTitle}</h2>
              <p className="mt-3 text-sm text-black/70 sm:text-base">{featuredDescription}</p>
              <div className="journal-meta mt-4">
                <span>{featuredDate}</span>
                <span>{featuredViews}</span>
                <span>{featuredComments}</span>
              </div>
              <p className="mt-4 text-sm font-semibold text-[#0a4757]">{copy.featuredAction}</p>
            </div>
          </Link>
        </article>

        <aside className="journal-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="display text-2xl font-bold">{copy.updatesTitle}</h2>
            <Link href={section.href} className="text-sm font-semibold text-[#0a4757] hover:text-[#073946]">
              {copy.updatesMore}
            </Link>
          </div>
          <p className="mt-2 text-sm text-black/65">{copy.updatesLead}</p>
          <div className="journal-divider mt-4">
            {copy.updates.map((item) => (
              <Link key={item.title} href={item.href} className="journal-list-item">
                <span className="journal-kicker">{item.tag}</span>
                <p className="mt-2 text-sm font-semibold leading-snug text-[#111b27]">{item.title}</p>
                <p className="mt-1 text-xs text-black/55">{item.metric}</p>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section className="reveal grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <article className="journal-card p-5 sm:p-6">
          <h2 className="display text-2xl font-bold">{copy.discussedTitle}</h2>
          <div className="journal-divider mt-4">
            {section.outcomes.slice(0, 3).map((item, index) => (
              <div key={item} className="py-3">
                <p className="text-sm font-semibold leading-snug text-[#111b27]">{item}</p>
                <p className="mt-1 text-xs text-black/55">{copy.discussedStats[index] ?? copy.discussedStats[0]}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="journal-card p-5 sm:p-6">
          <h2 className="display text-2xl font-bold">{copy.guideTitle}</h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {copy.guideItems.map((item) => (
              <Link key={item} href={section.href} className="journal-chip">
                {item}
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="reveal journal-nav-grid">
        <article className="journal-card p-5 sm:p-6">
          <span className="journal-kicker">{copy.navigatorTitle}</span>
          <p className="mt-3 text-sm text-black/68 sm:text-base">{copy.navigatorLead}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {copy.navigatorTabs.map((tab, index) => (
              <Link key={tab} href={copy.navigatorActionHref} className={`journal-tab ${index === 0 ? 'journal-tab-active' : ''}`}>
                {tab}
              </Link>
            ))}
          </div>
          <Link href={copy.navigatorActionHref} className="journal-nav-link mt-5 inline-flex">
            {copy.navigatorAction}
          </Link>
        </article>

        <div className="grid gap-3 sm:grid-cols-2">
          {copy.navigatorCards.map((item) => (
            <Link key={item.title} href={item.href} className={`journal-nav-card ${item.accent ? 'journal-nav-card-accent' : ''}`}>
              <div className="journal-nav-stat">
                <span className="display text-3xl font-bold">{item.stat}</span>
                <span className="text-xs uppercase tracking-[0.12em] text-black/60">{item.statLabel}</span>
              </div>
              <h3 className="display mt-3 text-2xl font-bold leading-tight text-[#131b25]">{item.title}</h3>
              <p className="mt-2 text-sm text-black/68">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="reveal space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="journal-kicker">Feed</span>
            <h2 className="section-title mt-3">{copy.feedTitle}</h2>
            <p className="section-subtitle mt-2">{copy.feedLead}</p>
          </div>
          <Link href={appHref} className="btn-ghost px-6 py-3 text-sm">
            {copy.feedAction}
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {feedCards.map((card, index) => {
            const isPrimary = index === 0;
            return (
              <article
                key={`${card.title}-${index}`}
                className={`journal-card overflow-hidden ${isPrimary ? 'lg:col-span-2 lg:row-span-2' : ''}`}
              >
                <Link href={card.href}>
                  <div className={isPrimary ? 'h-72 sm:h-80 lg:h-[420px]' : 'h-56'}>
                    <img src={card.image} alt={card.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4 sm:p-5">
                    <span className="journal-kicker">{card.tag}</span>
                    <h3 className={`mt-3 font-bold leading-tight text-[#141b22] ${isPrimary ? 'display text-3xl sm:text-4xl' : 'display text-2xl'}`}>
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm text-black/70">{card.description}</p>
                    <div className="journal-meta mt-3">
                      <span>{card.date}</span>
                      <span>{card.views}</span>
                      <span>{card.comments}</span>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="reveal grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <article className="journal-card p-5 sm:p-6">
          <h2 className="display text-2xl font-bold">{copy.collectionsTitle}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {copy.collections.map((item) => (
              <Link key={item.title} href={item.href} className="rounded-2xl border bg-white p-4 transition hover:bg-[#fff8df]" style={{ borderColor: 'var(--line)' }}>
                <h3 className="display text-xl font-bold leading-snug">{item.title}</h3>
                <p className="mt-2 text-sm text-black/65">{item.description}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className="journal-card journal-grid-bg p-6 sm:p-7">
          <h2 className="display text-3xl font-bold leading-tight">{copy.newsletterTitle}</h2>
          <p className="mt-3 text-sm text-black/70">{copy.newsletterLead}</p>
          <Link href={copy.heroSecondaryHref} className="btn-secondary mt-6 px-6 py-3 text-sm">
            {copy.newsletterButton}
          </Link>
        </article>
      </section>

      <section className="reveal space-y-4 pb-2">
        <div>
          <span className="journal-kicker">{copy.faqTitle}</span>
          <h2 className="section-title mt-3">{copy.faqLead}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {section.faqs.map((faq) => (
            <article key={faq.question} className="journal-card p-5">
              <h3 className="display text-xl font-bold leading-tight">{faq.question}</h3>
              <p className="mt-3 text-sm text-black/70">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
