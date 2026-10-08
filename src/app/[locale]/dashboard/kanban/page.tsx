import KanbanViewPage from '@/features/kanban/components/kanban-view-page';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('kanban')
  };
}

export default function page() {
  return <KanbanViewPage />;
}
