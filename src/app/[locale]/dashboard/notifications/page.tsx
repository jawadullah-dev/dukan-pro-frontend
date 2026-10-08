import NotificationsPage from '@/features/notifications/components/notifications-page';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('notifications')
  };
}

export default function Page() {
  return <NotificationsPage />;
}
