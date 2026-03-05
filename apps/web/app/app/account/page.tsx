import type { Metadata } from 'next';
import { AccountSettingsClient } from '@/components/account-settings-client';

export const metadata: Metadata = {
  title: 'Account Settings',
  description: 'Manage your profile, locale and password for Picoria App.'
};

export default function AppAccountPage() {
  return <AccountSettingsClient lang="en" />;
}
