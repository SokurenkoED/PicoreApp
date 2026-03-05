import type { Metadata } from 'next';
import { AppDashboardClient } from '@/components/app-dashboard-client';

export const metadata: Metadata = {
  title: 'RU App Dashboard',
  description: 'Пользовательский дашборд с генерациями, процессами и кабинетом.'
};

export default function RuAppPage() {
  return <AppDashboardClient lang="ru" />;
}
