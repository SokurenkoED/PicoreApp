export type RuSectionSlug =
  | 'neiro-fotosessii'
  | 'gotovye-obrazy'
  | 'ozhivit-foto'
  | 'blog'
  | 'otzyvy'
  | 'faq'
  | 'sotrudnichestvo';

type MegaColumnLink = {
  label: string;
  href: string;
};

type MegaColumn = {
  title: string;
  links: MegaColumnLink[];
};

type MegaFeatured = {
  badge: string;
  title: string;
  description: string;
  image: string;
  href: string;
};

type MegaMenu = {
  title: string;
  viewAllHref: string;
  columns: MegaColumn[];
  featured: MegaFeatured;
};

type SectionExample = {
  image: string;
  title: string;
  description: string;
};

type SectionFaq = {
  question: string;
  answer: string;
};

export type RuSection = {
  slug: RuSectionSlug;
  label: string;
  href: `/ru/${string}`;
  pageTitle: string;
  pageDescription: string;
  heroTitle: string;
  heroLead: string;
  seoLead: string;
  outcomes: string[];
  examples: SectionExample[];
  faqs: SectionFaq[];
  mega?: MegaMenu;
};

export const ruSections: RuSection[] = [
  {
    slug: 'neiro-fotosessii',
    label: 'Нейро-фотосессии',
    href: '/ru/neiro-fotosessii',
    pageTitle: 'Нейро-фотосессии онлайн',
    pageDescription: 'Подборки нейро-фотосессий для личного бренда, бизнеса и социальных сетей.',
    heroTitle: 'Нейро-фотосессии под любую задачу и настроение',
    heroLead:
      'Подберите сценарий съёмки, который точно попадает в ваш стиль: студия, город, бизнес, лайфстайл и сезонные подборки.',
    seoLead:
      'Страница создана как SEO-хаб: включает сценарии, примеры и прямой переход в генерацию, чтобы пользователь быстро принимал решение.',
    outcomes: [
      'Сценарии для личного бренда, резюме, dating и соцсетей.',
      'Быстрый путь: выбор идеи, загрузка фото, готовая серия кадров.',
      'Единый визуальный стиль в каждой подборке и ракурсе.'
    ],
    examples: [
      {
        image: '/samples/minimal-studio-1.svg',
        title: 'Студийная нейро-фотосессия',
        description: 'Чистый свет, нейтральный фон, акцент на лице и одежде.'
      },
      {
        image: '/samples/corporate-headshots-2.svg',
        title: 'Деловой портрет',
        description: 'Строгая визуальная подача для LinkedIn, сайта и презентаций.'
      },
      {
        image: '/samples/travel-lifestyle-1.svg',
        title: 'Лайфстайл в городе',
        description: 'Естественная атмосфера и динамичные кадры для контента.'
      },
      {
        image: '/samples/cinematic-portrait-2.svg',
        title: 'Кинематографичный портрет',
        description: 'Глубокий свет и выразительный характер для личного бренда.'
      }
    ],
    faqs: [
      {
        question: 'Сколько фото нужно загрузить для старта?',
        answer:
          'Рекомендуем от 8 до 15 разных портретов. Чем разнообразнее исходники, тем стабильнее и точнее результат.'
      },
      {
        question: 'Можно ли выбрать стиль под конкретную платформу?',
        answer:
          'Да. Сценарии подходят под Telegram, Instagram, LinkedIn, сайты экспертов и рекламные материалы.'
      },
      {
        question: 'Как быстро будут готовы фотографии?',
        answer: 'Обычно генерация занимает несколько минут. Статус задачи отображается в личном кабинете.'
      }
    ],
    mega: {
      title: 'Все нейро-фотосессии',
      viewAllHref: '/ru/neiro-fotosessii',
      columns: [
        {
          title: 'Популярные сцены',
          links: [
            { label: 'В студии', href: '/ru/neiro-fotosessii#studio' },
            { label: 'В офисе', href: '/ru/neiro-fotosessii#office' },
            { label: 'На улице', href: '/ru/neiro-fotosessii#street' },
            { label: 'У окна', href: '/ru/neiro-fotosessii#window' },
            { label: 'В кафе', href: '/ru/neiro-fotosessii#cafe' }
          ]
        },
        {
          title: 'Сезонные идеи',
          links: [
            { label: 'Весенний образ', href: '/ru/neiro-fotosessii#spring' },
            { label: 'Летний вайб', href: '/ru/neiro-fotosessii#summer' },
            { label: 'Осенний городской', href: '/ru/neiro-fotosessii#autumn' },
            { label: 'Зимняя студия', href: '/ru/neiro-fotosessii#winter' },
            { label: 'Праздничная серия', href: '/ru/neiro-fotosessii#holiday' }
          ]
        },
        {
          title: 'Под бизнес-задачи',
          links: [
            { label: 'Для эксперта', href: '/ru/neiro-fotosessii#expert' },
            { label: 'Для команды', href: '/ru/neiro-fotosessii#team' },
            { label: 'Для портфолио', href: '/ru/neiro-fotosessii#portfolio' },
            { label: 'Для резюме', href: '/ru/neiro-fotosessii#resume' },
            { label: 'Для рекламы', href: '/ru/neiro-fotosessii#ads' }
          ]
        }
      ],
      featured: {
        badge: 'Популярное',
        title: 'Фотосессия в студии',
        description: 'Универсальный формат для портрета, бизнеса и соцсетей.',
        image: '/samples/minimal-studio-1.svg',
        href: '/ru/neiro-fotosessii#studio'
      }
    }
  },
  {
    slug: 'gotovye-obrazy',
    label: 'Готовые образы',
    href: '/ru/gotovye-obrazy',
    pageTitle: 'Готовые образы для ИИ-фото',
    pageDescription: 'Каталог готовых образов: от делового до fashion и lifestyle направлений.',
    heroTitle: 'Готовые образы: выбирайте стиль за 30 секунд',
    heroLead:
      'Не нужно придумывать концепцию с нуля. Выбирайте готовые образные пакеты и получайте цельную серию фотографий.',
    seoLead:
      'Для SEO и удобства: страница объединяет популярные визуальные направления и сокращает путь до покупки генерации.',
    outcomes: [
      'Подборки под личный бренд, экспертный контент и маркетинг.',
      'Предсказуемый визуальный результат благодаря заранее собранным пресетам.',
      'Ускорение запуска рекламных и контентных креативов.'
    ],
    examples: [
      {
        image: '/templates/style-card-1.svg',
        title: 'Clean light',
        description: 'Минималистичная студийная эстетика для экспертного позиционирования.'
      },
      {
        image: '/templates/style-card-2.svg',
        title: 'Warm film',
        description: 'Тёплый киноплёночный характер для lifestyle-контента.'
      },
      {
        image: '/templates/style-card-3.svg',
        title: 'Soft editorial',
        description: 'Fashion-направление для визуально цельных подборок.'
      },
      {
        image: '/templates/style-card-4.svg',
        title: 'Rich contrast',
        description: 'Контрастный стиль для заметных рекламных креативов.'
      }
    ],
    faqs: [
      {
        question: 'Можно ли настроить образ под мой бренд-бук?',
        answer: 'Да, можно зафиксировать цветовую температуру, настроение и тип ретуши под вашу коммуникацию.'
      },
      {
        question: 'Подходят ли готовые образы для рекламы?',
        answer: 'Да. Многие подборки адаптированы под performance-креативы, обложки и карточки товаров.'
      },
      {
        question: 'Сколько образов можно протестировать за один запуск?',
        answer: 'Вы можете запускать несколько задач подряд и сравнивать результаты по качеству и конверсии.'
      }
    ],
    mega: {
      title: 'Каталог готовых образов',
      viewAllHref: '/ru/gotovye-obrazy',
      columns: [
        {
          title: 'Для личного бренда',
          links: [
            { label: 'Экспертный', href: '/ru/gotovye-obrazy#expert' },
            { label: 'Премиум', href: '/ru/gotovye-obrazy#premium' },
            { label: 'Динамичный', href: '/ru/gotovye-obrazy#dynamic' },
            { label: 'Классический', href: '/ru/gotovye-obrazy#classic' },
            { label: 'Casual', href: '/ru/gotovye-obrazy#casual' }
          ]
        },
        {
          title: 'Для бизнеса',
          links: [
            { label: 'Корпоративный', href: '/ru/gotovye-obrazy#corporate' },
            { label: 'Для эксперта', href: '/ru/gotovye-obrazy#consultant' },
            { label: 'Для курсов', href: '/ru/gotovye-obrazy#courses' },
            { label: 'Для карточек', href: '/ru/gotovye-obrazy#marketplace' },
            { label: 'Для презентаций', href: '/ru/gotovye-obrazy#pitch' }
          ]
        },
        {
          title: 'Креативные',
          links: [
            { label: 'Кинематографичный', href: '/ru/gotovye-obrazy#cinematic' },
            { label: 'Fashion', href: '/ru/gotovye-obrazy#fashion' },
            { label: 'Retro', href: '/ru/gotovye-obrazy#retro' },
            { label: 'Street', href: '/ru/gotovye-obrazy#street' },
            { label: 'Art', href: '/ru/gotovye-obrazy#art' }
          ]
        }
      ],
      featured: {
        badge: 'Хит',
        title: 'Soft editorial',
        description: 'Один из самых конверсионных образов для fashion и экспертов.',
        image: '/templates/style-card-3.svg',
        href: '/ru/gotovye-obrazy#editorial'
      }
    }
  },
  {
    slug: 'ozhivit-foto',
    label: 'Оживить фото',
    href: '/ru/ozhivit-foto',
    pageTitle: 'Оживить фото с помощью ИИ',
    pageDescription: 'Сценарии оживления фото: анимированные портреты, видео-обложки и социальные креативы.',
    heroTitle: 'Оживите фото и превратите статичный кадр в динамику',
    heroLead:
      'Используйте AI-анимацию, чтобы добавить движение, выразительность и эффект присутствия в фотографиях для контента и рекламы.',
    seoLead:
      'Отдельная страница под SEO-запросы «оживить фото»: подробно показывает сценарии использования, выгоды и CTA.',
    outcomes: [
      'Анимированные портреты для Reels, Shorts и сторис.',
      'Видео-обложки для Telegram-каналов, курсов и воронок продаж.',
      'Быстрый контент-пайплайн без студийных съёмок и монтажной команды.'
    ],
    examples: [
      {
        image: '/templates/before-after-1.svg',
        title: 'Портрет + движение камеры',
        description: 'Лёгкий параллакс и микромимика для естественного эффекта.'
      },
      {
        image: '/templates/before-after-2.svg',
        title: 'Эмоциональный ролик',
        description: 'Добавление динамики света и атмосферы в статичное фото.'
      },
      {
        image: '/samples/dramatic-light-1.svg',
        title: 'Кинематографичная анимация',
        description: 'Подходит для трейлеров, анонсов и экспертных запусков.'
      },
      {
        image: '/samples/beauty-closeup-1.svg',
        title: 'Бьюти-анимация',
        description: 'Деликатное движение для аккуратного премиум-впечатления.'
      }
    ],
    faqs: [
      {
        question: 'Нужны ли навыки монтажа, чтобы оживить фото?',
        answer: 'Нет. Вы выбираете сценарий, анимация собирается автоматически, без ручного монтажа.'
      },
      {
        question: 'Можно ли использовать результат в рекламе?',
        answer: 'Да, итоговые материалы подходят для digital-рекламы и контентных воронок.'
      },
      {
        question: 'Оживление фото доступно с телефона?',
        answer: 'Да, загрузка исходников и запуск сценария доступны в мобильном браузере и Telegram.'
      }
    ],
    mega: {
      title: 'Сценарии оживления фото',
      viewAllHref: '/ru/ozhivit-foto',
      columns: [
        {
          title: 'Для соцсетей',
          links: [
            { label: 'Reels-обложки', href: '/ru/ozhivit-foto#reels' },
            { label: 'Stories', href: '/ru/ozhivit-foto#stories' },
            { label: 'Shorts', href: '/ru/ozhivit-foto#shorts' },
            { label: 'Telegram-контент', href: '/ru/ozhivit-foto#telegram' },
            { label: 'YouTube-превью', href: '/ru/ozhivit-foto#youtube' }
          ]
        },
        {
          title: 'Для бизнеса',
          links: [
            { label: 'Реклама', href: '/ru/ozhivit-foto#ads' },
            { label: 'Лендинги', href: '/ru/ozhivit-foto#landing' },
            { label: 'Карточки курсов', href: '/ru/ozhivit-foto#courses' },
            { label: 'CRM-рассылки', href: '/ru/ozhivit-foto#crm' },
            { label: 'Презентации', href: '/ru/ozhivit-foto#presentations' }
          ]
        },
        {
          title: 'Эффекты',
          links: [
            { label: 'Плавная камера', href: '/ru/ozhivit-foto#camera' },
            { label: 'Световые акценты', href: '/ru/ozhivit-foto#lights' },
            { label: 'Микродвижение', href: '/ru/ozhivit-foto#micro' },
            { label: 'Кино-эффект', href: '/ru/ozhivit-foto#cinema' },
            { label: 'Мягкий zoom', href: '/ru/ozhivit-foto#zoom' }
          ]
        }
      ],
      featured: {
        badge: 'Новый',
        title: 'Портрет с динамикой',
        description: 'Статичный кадр превращается в короткий живой ролик для соцсетей.',
        image: '/templates/before-after-2.svg',
        href: '/ru/ozhivit-foto#reels'
      }
    }
  },
  {
    slug: 'blog',
    label: 'Блог',
    href: '/ru/blog',
    pageTitle: 'Блог Picoria',
    pageDescription: 'Материалы по AI-фото, кейсам внедрения и росту конверсии на визуальном контенте.',
    heroTitle: 'Блог о нейрофотосессиях, маркетинге и AI-контенте',
    heroLead:
      'Публикуем разборы, тренды и практические гайды, чтобы вы быстрее масштабировали визуальный контент для бизнеса.',
    seoLead:
      'Блоговая страница усиливает SEO-покрытие по информационным запросам и подогревает пользователя перед запуском генерации.',
    outcomes: [
      'Актуальные сценарии применения нейрофото в бизнесе.',
      'Практика повышения конверсии с помощью визуала.',
      'Контент для маркетологов, экспертов и создателей курсов.'
    ],
    examples: [
      {
        image: '/templates/hero-shot-1.svg',
        title: 'Как выбрать стиль под воронку',
        description: 'Разбор визуальных сценариев для холодного и тёплого трафика.'
      },
      {
        image: '/templates/hero-shot-2.svg',
        title: 'AI-фото для карточек эксперта',
        description: 'Подходы для Telegram, сайта и образовательных платформ.'
      },
      {
        image: '/samples/streetwear-editorial-1.svg',
        title: 'Контент-план на месяц',
        description: 'Как за 1 день подготовить визуалы на 4 недели публикаций.'
      },
      {
        image: '/samples/retro-film-1.svg',
        title: 'Тренды 2026',
        description: 'Какие стили и форматы будут доминировать в этом году.'
      }
    ],
    faqs: [
      {
        question: 'Как часто обновляется блог?',
        answer: 'Мы публикуем новые материалы каждую неделю: кейсы, гайды и аналитические обзоры.'
      },
      {
        question: 'Можно ли использовать материалы как чек-лист для команды?',
        answer: 'Да, статьи пишутся в формате практических инструкций и подходят для внутренних процессов.'
      },
      {
        question: 'Будут ли кейсы из разных ниш?',
        answer: 'Да, мы планируем кейсы для экспертов, e-commerce, обучения, агентств и персонального бренда.'
      }
    ]
  },
  {
    slug: 'otzyvy',
    label: 'Отзывы',
    href: '/ru/otzyvy',
    pageTitle: 'Отзывы клиентов Picoria',
    pageDescription: 'Реальные отзывы пользователей о качестве AI-фотосессий и скорости запуска.',
    heroTitle: 'Отзывы клиентов о нейро-фотосессиях Picoria',
    heroLead:
      'Собрали обратную связь от экспертов, маркетологов и предпринимателей, которые уже используют AI-фото в продажах.',
    seoLead:
      'Страница отзывов закрывает возражения и повышает доверие: это важный коммерческий фактор и для SEO, и для конверсии.',
    outcomes: [
      'Доказательства качества результата из реальных кейсов.',
      'Понимание, как сервис работает в разных нишах.',
      'Социальное доказательство для новых клиентов и партнёров.'
    ],
    examples: [
      {
        image: '/templates/testimonial-1.svg',
        title: 'Эксперт по маркетингу',
        description: '«Контент стал выглядеть дороже, а подготовка занимает в разы меньше времени».'
      },
      {
        image: '/templates/testimonial-2.svg',
        title: 'Продюсер онлайн-курсов',
        description: '«Используем кадры в рекламе и на лендингах, конверсия стала стабильнее».'
      },
      {
        image: '/templates/testimonial-3.svg',
        title: 'Владелец агентства',
        description: '«Команда закрывает визуальный продакшн без фотостудии и подрядчиков».'
      },
      {
        image: '/samples/corporate-headshots-1.svg',
        title: 'HR-команда',
        description: '«Оформили профили сотрудников в едином стиле за один рабочий день».'
      }
    ],
    faqs: [
      {
        question: 'Отзывы проходят модерацию?',
        answer: 'Да, мы публикуем только подтверждённые кейсы с понятным контекстом использования.'
      },
      {
        question: 'Можно добавить свой отзыв?',
        answer: 'Да, после использования сервиса вы можете отправить отзыв и примеры результатов через поддержку.'
      },
      {
        question: 'Есть ли отзывы от B2B-команд?',
        answer: 'Да, среди клиентов есть агентства, образовательные проекты и продуктовые команды.'
      }
    ]
  },
  {
    slug: 'faq',
    label: 'Ответы и вопросы',
    href: '/ru/faq',
    pageTitle: 'Ответы и вопросы по Picoria',
    pageDescription: 'FAQ по работе сервиса: загрузка фото, оплата, сроки генерации и права использования.',
    heroTitle: 'Ответы и вопросы: всё о запуске нейро-фотосессий',
    heroLead:
      'Собрали ключевые ответы по тарифам, загрузке исходников, приватности и использованию результатов в коммерции.',
    seoLead:
      'Отдельная FAQ-страница помогает и SEO, и поддержке: пользователь быстрее находит ответ и реже уходит из воронки.',
    outcomes: [
      'Быстрые ответы на частые вопросы до оплаты и после запуска.',
      'Прозрачные правила по срокам, качеству и конфиденциальности.',
      'Понятные инструкции для первого запуска без менеджера.'
    ],
    examples: [
      {
        image: '/samples/tech-founder-1.svg',
        title: 'Старт за 5 минут',
        description: 'Пошаговый сценарий от регистрации до готовых изображений.'
      },
      {
        image: '/samples/tech-founder-2.svg',
        title: 'Работа с тарифами',
        description: 'Как выбирать пакеты кредитов под разные объёмы задач.'
      },
      {
        image: '/samples/fitness-pro-1.svg',
        title: 'Коммерческое использование',
        description: 'Где можно легально применять полученные материалы.'
      },
      {
        image: '/samples/fitness-pro-2.svg',
        title: 'Политика приватности',
        description: 'Как обрабатываются и защищаются загруженные исходники.'
      }
    ],
    faqs: [
      {
        question: 'Можно ли использовать фотографии в рекламе?',
        answer: 'Да, результаты можно использовать в коммерческих коммуникациях, если соблюдены правила платформ.'
      },
      {
        question: 'Удаляются ли исходные фото после генерации?',
        answer: 'Мы придерживаемся политики минимального хранения и даём инструменты для удаления данных по запросу.'
      },
      {
        question: 'Что делать, если результат не подходит?',
        answer: 'Запустите генерацию с другим стилем или пакетом исходников. Это обычно решает вопрос качества.'
      }
    ]
  },
  {
    slug: 'sotrudnichestvo',
    label: 'Сотрудничество',
    href: '/ru/sotrudnichestvo',
    pageTitle: 'Сотрудничество с Picoria',
    pageDescription: 'Партнёрские форматы: агентства, авторы, инфопродукты, white-label и спецпроекты.',
    heroTitle: 'Сотрудничество: партнёрства, интеграции и спецпроекты',
    heroLead:
      'Открыты к сотрудничеству с агентствами, экспертами, школами, продюсерами и компаниями, которым нужен масштабируемый AI-визуал.',
    seoLead:
      'Страница партнёрства расширяет коммерческое ядро сайта: сюда приводятся тёплые B2B-лиды и входящие предложения.',
    outcomes: [
      'Партнёрские условия для агентств и продюсерских команд.',
      'Совместные спецпроекты и брендовые визуальные кампании.',
      'Интеграции в образовательные и корпоративные продукты.'
    ],
    examples: [
      {
        image: '/samples/luxury-fashion-1.svg',
        title: 'Партнёрство с агентствами',
        description: 'Закрываем часть продакшна для клиентских проектов и рекламных запусков.'
      },
      {
        image: '/samples/luxury-fashion-2.svg',
        title: 'Коллаборации с экспертами',
        description: 'Собираем персональные визуальные пакеты для обучающих продуктов и медиа.'
      },
      {
        image: '/samples/wedding-classic-1.svg',
        title: 'White-label форматы',
        description: 'Опциональные модели сотрудничества под ваш бренд и вашу аудиторию.'
      },
      {
        image: '/samples/wedding-classic-2.svg',
        title: 'B2B кейсы',
        description: 'Настраиваем регулярный поток контента для команд и продуктов.'
      }
    ],
    faqs: [
      {
        question: 'Какие форматы сотрудничества доступны?',
        answer: 'Партнёрки, referral-модели, white-label и совместные маркетинговые интеграции.'
      },
      {
        question: 'Есть ли условия для агентств?',
        answer: 'Да, для агентств доступен приоритетный формат работы и отдельные условия по объёмам.'
      },
      {
        question: 'Куда отправлять предложение о партнёрстве?',
        answer: 'Напишите в поддержку через Telegram-бота или форму в приложении, мы ответим и согласуем формат.'
      }
    ]
  }
];

export const ruSectionsMap = new Map<RuSectionSlug, RuSection>(ruSections.map((item) => [item.slug, item]));

export const ruHeaderItems = ruSections.map(({ slug, label, href, mega }) => ({
  slug,
  label,
  href,
  mega
}));

export const ruSectionPaths = ruSections.map((section) => section.href);

export function getRuSectionBySlug(slug: string): RuSection | undefined {
  return ruSectionsMap.get(slug as RuSectionSlug);
}
