import PageContainer from '@/components/layout/page-container';
import { AppearanceSettings } from '@/features/appearance/components/appearance-settings';

export const metadata = {
  title: 'Appearance'
};

export default function AppearancePage() {
  return (
    <PageContainer>
      <AppearanceSettings />
    </PageContainer>
  );
}
