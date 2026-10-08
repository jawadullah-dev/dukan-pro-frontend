import IconsViewPage from '@/features/elements/components/icons-view-page';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('icons')
  };
}

export default function page() {
  return <IconsViewPage />;
}
