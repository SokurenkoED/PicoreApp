import type { Metadata } from 'next';
import { AppDashboardClient } from '@/components/app-dashboard-client';

export const metadata: Metadata = {
  title: 'App Dashboard',
  description: 'User dashboard with generation flow, process tracking and account access.'
};

export default function AppPage() {
  return <AppDashboardClient lang="en" />;
}
