import PageContainer from '@/components/layout/page-container';
import { AppearanceSettings } from '@/features/appearance/components/appearance-settings';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('appearance')
  };
}

export default function AppearancePage() {
  return (
    <PageContainer>
      <AppearanceSettings />
    </PageContainer>
  );
}
