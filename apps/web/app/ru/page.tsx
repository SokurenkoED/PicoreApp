import Link from 'next/link';
import { AppEntryButton } from '@/components/app-entry-button';

type ExampleItem = {
  image: string;
  title: string;
};

function ExampleRow({
  items,
  direction = 'ltr',
  animated = false
}: {
  items: ExampleItem[];
  direction?: 'ltr' | 'rtl';
  animated?: boolean;
}) {
  const loopItems = animated ? [...items, ...items] : items;

  if (!animated) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {loopItems.map((item) => (
          <figure
            key={item.image}
            className="media-frame overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
          >
            <img src={item.image} alt={`${item.title} пример`} />
            <figcaption
              className="border-t px-3 py-2 text-xs font-semibold uppercase tracking-[0.11em] text-black/65"
              style={{ borderColor: 'var(--line)' }}
            >
              {item.title}
            </figcaption>
          </figure>
        ))}
      </div>
    );
  }

  return (
    <div className="examples-motion-shell">
      <div
        className={`examples-motion-track ${
          direction === 'ltr' ? 'examples-motion-ltr' : 'examples-motion-rtl'
        }`}
      >
        {loopItems.map((item, index) => (
          <div key={`${item.image}-${index}`} className="examples-motion-item">
            <figure className="media-frame overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
              <img src={item.image} alt={`${item.title} пример`} />
              <figcaption
                className="border-t px-3 py-2 text-xs font-semibold uppercase tracking-[0.11em] text-black/65"
                style={{ borderColor: 'var(--line)' }}
              >
                {item.title}
              </figcaption>
            </figure>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RuHomePage() {
  const photoshootExamples = [
    { image: '/samples/dramatic-light-2.svg', title: 'Студийный драматичный' },
    { image: '/samples/beauty-closeup-2.svg', title: 'Бьюти крупный план' },
    { image: '/samples/cinematic-portrait-2.svg', title: 'Кинематографичный портрет' },
    { image: '/samples/luxury-fashion-2.svg', title: 'Премиум fashion' },
    { image: '/samples/corporate-headshots-2.svg', title: 'Деловой портрет' }
  ];

  const presetExamples = [
    { image: '/templates/style-card-1.svg', title: 'Пресет: чистый свет' },
    { image: '/templates/style-card-2.svg', title: 'Пресет: теплый film' },
    { image: '/templates/style-card-3.svg', title: 'Пресет: soft editorial' },
    { image: '/templates/style-card-4.svg', title: 'Пресет: контраст' },
    { image: '/templates/hero-shot-2.svg', title: 'Пресет: signature mix' }
  ];

  const coupleGroupExamples = [
    { image: '/samples/wedding-classic-2.svg', title: 'Парная классика' },
    { image: '/samples/travel-lifestyle-2.svg', title: 'Парная lifestyle' },
    { image: '/samples/retro-film-2.svg', title: 'Друзья в стиле retro' },
    { image: '/samples/streetwear-editorial-2.svg', title: 'Групповая editorial' },
    { image: '/samples/fitness-pro-2.svg', title: 'Командная sports' }
  ];

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="card reveal relative overflow-hidden p-4 sm:p-5 lg:p-6">
        <div className="absolute -right-14 -top-20 h-64 w-64 rounded-full bg-[#0f4a5a]/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#cd6b45]/10 blur-3xl" />
        <div className="grid items-center gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h1 className="display mt-1 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              Создавайте красивые ИИ-фото себя — без студии и камеры
            </h1>
            <p className="mt-3 max-w-2xl text-base text-black/75 sm:text-lg">
              Крупнейший в России сервис нейрофотосессий для создания ИИ-фото, которые не отличить от реальных.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <AppEntryButton href="/ru/app" className="btn-cta px-8 py-4 text-base sm:text-lg">
                Попробовать бесплатно
              </AppEntryButton>
            </div>
          </div>

          <div className="media-frame w-full max-w-sm justify-self-end">
            <img src="/templates/hero-shot-2.svg" alt="Шаблон hero изображения" />
          </div>
        </div>
      </section>

      <section className="reveal space-y-5 pb-2">
        <div>
          <span className="eyebrow">Создание фотосессий</span>
          <h2 className="section-title mt-3">Примеры готовых фотосессий</h2>
          <p className="section-subtitle mt-2">
            Акцент на итоговые фотосессии: от исходников до готовой визуальной серии.
          </p>
        </div>
        <ExampleRow items={photoshootExamples} direction="ltr" animated />
      </section>

      <section className="reveal space-y-5 pb-2">
        <div>
          <span className="eyebrow">Работа с пресетами</span>
          <h2 className="section-title mt-3">Каталог пресетов для разных сцен</h2>
          <p className="section-subtitle mt-2">
            Комбинируйте пресеты и стили, чтобы быстро собирать разные визуальные сценарии.
          </p>
        </div>
        <ExampleRow items={presetExamples} direction="rtl" animated />
      </section>

      <section className="reveal space-y-5 pb-2">
        <div>
          <span className="eyebrow">Парные и групповые</span>
          <h2 className="section-title mt-3">Примеры парных и групповых фотосессий</h2>
          <p className="section-subtitle mt-2">
            Подборки для сцен с двумя и более людьми с сохранением единого стиля.
          </p>
        </div>
        <ExampleRow items={coupleGroupExamples} direction="ltr" animated />
      </section>

      <section className="reveal space-y-4">
        <div>
          <span className="eyebrow">Как это работает</span>
          <h2 className="section-title mt-3">Прозрачный пользовательский путь</h2>
          <p className="section-subtitle mt-2">
            Архитектура повторяет лучшие практики в нише: короткий onboarding, мгновенный запуск и видимый статус
            обработки.
          </p>
        </div>
        <div className="stagger grid gap-4 md:grid-cols-3">
          <article className="card p-5">
            <p className="eyebrow">Шаг 01</p>
            <h3 className="display mt-3 text-2xl font-bold">Загрузите фото</h3>
            <p className="mt-2 text-sm text-black/70">Несколько исходников для более стабильного результата.</p>
          </article>
          <article className="card p-5">
            <p className="eyebrow">Шаг 02</p>
            <h3 className="display mt-3 text-2xl font-bold">Выберите стиль</h3>
            <p className="mt-2 text-sm text-black/70">Каталог с SEO-страницами и примерами для принятия решения.</p>
          </article>
          <article className="card p-5">
            <p className="eyebrow">Шаг 03</p>
            <h3 className="display mt-3 text-2xl font-bold">Получите галерею</h3>
            <p className="mt-2 text-sm text-black/70">Очередь BullMQ, прогресс и готовые URL результатов.</p>
          </article>
        </div>
      </section>

      <section className="card reveal p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="eyebrow">Шаблонные блоки</span>
            <h2 className="section-title mt-3">Визуалы до/после для рекламных лендингов</h2>
          </div>
          <AppEntryButton href="/ru/app" className="btn-ghost">
            Протестировать генерацию
          </AppEntryButton>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="media-frame">
            <img src="/templates/before-after-1.svg" alt="Шаблон до/после один" />
          </div>
          <div className="media-frame">
            <img src="/templates/before-after-2.svg" alt="Шаблон до/после два" />
          </div>
        </div>
      </section>

    </div>
  );
}
