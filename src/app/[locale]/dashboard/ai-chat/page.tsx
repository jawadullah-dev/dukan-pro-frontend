import PageContainer from '@/components/layout/page-container';
import { AiChatDemo } from '@/features/ai-chat/components/ai-chat-demo';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('aiChat')
  };
}

export default function Page() {
  return (
    <PageContainer>
      <AiChatDemo />
    </PageContainer>
  );
}
