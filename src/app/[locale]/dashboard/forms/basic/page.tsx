import PageContainer from '@/components/layout/page-container';
import DemoForm from '@/components/forms/demo-form';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('basicForm')
  };
}

export default function Page() {
  return (
    <PageContainer pageTitle='pages.basicForm.title' pageDescription='pages.basicForm.description'>
      <DemoForm />
    </PageContainer>
  );
}
