import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { useT } from '@/i18n/use-t';
import type { PlatformShopStatus } from '../api/types';
import type { ShopStatusBadgeProps, ShopStatusConfig } from '@/types';

const STATUS_CONFIG: Record<PlatformShopStatus, ShopStatusConfig> = {
  ACTIVE: {
    labelKey: 'platform.active',
    className:
      'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    icon: 'circle'
  },
  TRIAL: {
    labelKey: 'platform.onTrial',
    className:
      'border-transparent bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    icon: 'exclusive'
  },
  EXPIRED: {
    labelKey: 'platform.expired',
    className: 'border-transparent bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    icon: 'circleX'
  }
};

export function ShopStatusBadge({ status }: ShopStatusBadgeProps) {
  const t = useT();
  const config = STATUS_CONFIG[status];
  const Icon = Icons[config.icon];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        config.className
      )}
    >
      <Icon className='h-3 w-3' />
      {t(config.labelKey)}
    </span>
  );
}
