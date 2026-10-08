import PageContainer from '@/components/layout/page-container';
import AdvancedFormPatterns from '@/features/forms/components/advanced-form-patterns';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('advancedForm')
  };
}

export default function Page() {
  return (
    <PageContainer
      pageTitle='pages.advancedForm.title'
      pageDescription='pages.advancedForm.description'
    >
      <AdvancedFormPatterns />
    </PageContainer>
  );
}
