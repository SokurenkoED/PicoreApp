import type { Metadata } from 'next';
import { AccountSettingsClient } from '@/components/account-settings-client';

export const metadata: Metadata = {
  title: 'Личный кабинет',
  description: 'Настройки профиля, язык и пароль для App в Picoria.'
};

export default function RuAppAccountPage() {
  return <AccountSettingsClient lang="ru" />;
}
