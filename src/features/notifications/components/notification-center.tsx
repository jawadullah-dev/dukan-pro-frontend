'use client';

import { Icons } from '@/components/icons';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { NotificationCard } from '@/components/ui/notification-card';
import { useNotificationStore } from '../utils/store';
import { useLocale } from 'next-intl';
import { useT } from '@/i18n/use-t';

const MAX_VISIBLE = 5;

const actionRoutes: Record<string, string> = {
  view: '/dashboard/overview',
  'view-product': '/dashboard/product',
  billing: '/dashboard/overview',
  open: '/dashboard/kanban',
  'open-chat': '/dashboard/chat'
};

export function NotificationCenter() {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore();
  const router = useRouter();
  const locale = useLocale();
  const t = useT();
  const count = unreadCount();
  const visibleNotifications = notifications.slice(0, MAX_VISIBLE);

  const handleAction = (notifId: string, actionId: string) => {
    const route = actionRoutes[actionId];
    if (route) {
      markAsRead(notifId);
      router.push(route);
    }
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type='button'
            variant='ghost'
            size='icon'
            aria-label={t('notifications.title')}
            className='relative h-8 w-8'
          />
        }
      >
        <Icons.notification className='h-4 w-4' />
        {count > 0 && (
          <span className='bg-primary text-primary-foreground absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium'>
            {count > 9 ? '9+' : count}
          </span>
        )}
        <span className='sr-only'>{t('notifications.title')}</span>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-[calc(100vw-2rem)] p-0 sm:w-[380px]' sideOffset={8}>
        <div className='flex items-center justify-between px-4 pt-3'>
          <Link
            href={`/${locale}/dashboard/notifications`}
            className='group flex items-center gap-1'
          >
            <h4 className='text-sm font-semibold group-hover:underline'>
              {t('notifications.title')}
            </h4>
            <Icons.chevronRight className='text-muted-foreground h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180' />
          </Link>
          <div className='flex items-center gap-2'>
            {count > 0 && (
              <span className='bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs'>
                {t('notifications.newCount', { count })}
              </span>
            )}
            {count > 0 && (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='text-muted-foreground h-auto px-2 py-1 text-xs'
                onClick={markAllAsRead}
              >
                {t('notifications.markAllAsRead')}
              </Button>
            )}
          </div>
        </div>
        <Separator />
        <ScrollArea className='h-[400px]'>
          {notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12'>
              <Icons.notification className='text-muted-foreground/40 mb-2 h-8 w-8' />
              <p className='text-muted-foreground text-sm'>{t('notifications.empty')}</p>
            </div>
          ) : (
            <div className='flex flex-col gap-1 p-2'>
              {visibleNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  id={notification.id}
                  title={notification.title}
                  body={notification.body}
                  status={notification.status}
                  createdAt={notification.createdAt}
                  actions={notification.actions}
                  onMarkAsRead={markAsRead}
                  onAction={handleAction}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
