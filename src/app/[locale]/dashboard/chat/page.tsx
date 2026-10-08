import ChatViewPage from '@/features/chat/components/chat-view-page';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('chat')
  };
}

export default function Page() {
  return <ChatViewPage />;
}
