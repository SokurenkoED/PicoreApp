import type { Metadata } from 'next';
import { PaymentsClient } from '@/components/payments-client';

export const metadata: Metadata = {
  title: 'Оплата',
  description: 'Покупка пакетов кредитов через Т-Банк.'
};

export default function RuPayPage() {
  return <PaymentsClient />;
}
