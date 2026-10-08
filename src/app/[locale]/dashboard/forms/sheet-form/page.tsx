import PageContainer from '@/components/layout/page-container';
import SheetFormDemo from '@/features/forms/components/sheet-form-demo';

export const metadata = {
  title: 'Dashboard: Sheet Form'
};

export default function Page() {
  return (
    <PageContainer pageTitle='pages.sheetForm.title' pageDescription='pages.sheetForm.description'>
      <SheetFormDemo />
    </PageContainer>
  );
}
