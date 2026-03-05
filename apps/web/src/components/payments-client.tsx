'use client';

import { useEffect, useState } from 'react';

type RuPackage = {
  id: string;
  title: string;
  priceRub: number;
  credits: number;
};

export function PaymentsClient() {
  const [items, setItems] = useState<RuPackage[]>([]);
  const [busyId, setBusyId] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const run = async () => {
      const res = await fetch('/api/ru/packages', { credentials: 'include' });
      if (!res.ok) {
        setError('Failed to load packages');
        return;
      }
      setItems((await res.json()) as RuPackage[]);
    };

    void run();
  }, []);

  const onBuy = async (packageId: string) => {
    setBusyId(packageId);
    setError('');
    try {
      const res = await fetch('/api/ru/payments/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId })
      });
      if (!res.ok) {
        setError(await res.text());
        return;
      }
      const data = (await res.json()) as { paymentUrl: string };
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="space-y-6">
      <section className="card p-6 sm:p-8">
        <span className="eyebrow">Тарифы и оплата</span>
        <h1 className="section-title mt-4">Пакеты кредитов для генерации</h1>
        <p className="section-subtitle mt-2">
          Выберите пакет, получите ссылку на оплату Т-Банк и пополните баланс в пару кликов.
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="stagger grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, idx) => (
          <article key={item.id} className="card overflow-hidden p-4">
            <div className="media-frame h-52">
              <img
                src={idx % 2 === 0 ? '/templates/hero-shot-2.svg' : '/templates/style-card-3.svg'}
                alt={`Шаблон пакета ${item.title}`}
              />
            </div>
            <div className="px-1 pb-1 pt-4">
              <h2 className="display text-2xl font-bold">{item.title}</h2>
              <p className="mt-2 text-sm text-black/70">{item.credits} credits</p>
              <p className="mt-3 display text-4xl font-extrabold">{item.priceRub} ₽</p>
              <button
                className="btn-primary mt-4 w-full"
                disabled={busyId === item.id}
                onClick={() => void onBuy(item.id)}
              >
                {busyId === item.id ? 'Создание платежа...' : 'Оплатить'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
