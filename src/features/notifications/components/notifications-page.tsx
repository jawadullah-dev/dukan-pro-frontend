'use client';

import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { NotificationCard } from '@/components/ui/notification-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from '@/i18n/navigation';
import { useNotificationStore } from '../utils/store';

const actionRoutes: Record<string, string> = {
  view: '/dashboard/overview',
  'view-product': '/dashboard/product',
  billing: '/dashboard/overview',
  open: '/dashboard/kanban',
  'open-chat': '/dashboard/chat'
};

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore();
  const router = useRouter();
  const t = useTranslations();
  const count = unreadCount();

  const unreadNotifications = notifications.filter((n) => n.status === 'unread');
  const readNotifications = notifications.filter((n) => n.status === 'read');

  const renderList = (items: typeof notifications) => {
    if (items.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center py-16'>
          <Icons.notification className='text-muted-foreground/40 mb-3 h-10 w-10' />
          <p className='text-muted-foreground text-sm'>{t('notifications.noNotifications')}</p>
        </div>
      );
    }

    return (
      <div className='flex flex-col gap-2'>
        {items.map((notification) => (
          <NotificationCard
            key={notification.id}
            id={notification.id}
            title={notification.title}
            body={notification.body}
            status={notification.status}
            createdAt={notification.createdAt}
            actions={notification.actions}
            onMarkAsRead={markAsRead}
            onAction={(notifId, actionId) => {
              const route = actionRoutes[actionId];
              if (route) {
                markAsRead(notifId);
                router.push(route);
              }
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <PageContainer
      pageTitle='pages.notifications.title'
      pageDescription='pages.notifications.description'
      pageHeaderAction={
        count > 0 ? (
          <Button type='button' variant='outline' size='sm' onClick={markAllAsRead}>
            {t('notifications.markAllAsRead')}
          </Button>
        ) : undefined
      }
    >
      <Tabs defaultValue='all'>
        <TabsList>
          <TabsTrigger value='all'>
            {t('notifications.tabAll')} ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value='unread'>
            {t('notifications.tabUnread')} ({unreadNotifications.length})
          </TabsTrigger>
          <TabsTrigger value='read'>
            {t('notifications.tabRead')} ({readNotifications.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value='all' className='mt-4'>
          {renderList(notifications)}
        </TabsContent>
        <TabsContent value='unread' className='mt-4'>
          {renderList(unreadNotifications)}
        </TabsContent>
        <TabsContent value='read' className='mt-4'>
          {renderList(readNotifications)}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
