import PageContainer from '@/components/layout/page-container';
import FormsShowcasePage from '@/features/forms/components/forms-showcase-page';

export const metadata = {
  title: 'Dashboard: Multi-Step Form'
};

export default function Page() {
  return (
    <PageContainer
      pageTitle='pages.multiStepForm.title'
      pageDescription='pages.multiStepForm.description'
    >
      <FormsShowcasePage />
    </PageContainer>
  );
}
