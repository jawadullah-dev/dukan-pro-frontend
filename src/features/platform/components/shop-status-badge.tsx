import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import type { PlatformShopStatus } from '../api/types';

const STATUS_CONFIG: Record<
  PlatformShopStatus,
  { label: string; className: string; icon: keyof typeof Icons }
> = {
  ACTIVE: {
    label: 'Active',
    className:
      'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    icon: 'circle'
  },
  TRIAL: {
    label: 'Trial',
    className:
      'border-transparent bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    icon: 'exclusive'
  },
  EXPIRED: {
    label: 'Expired',
    className: 'border-transparent bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    icon: 'circleX'
  }
};

export function ShopStatusBadge({ status }: { status: PlatformShopStatus }) {
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
      {config.label}
    </span>
  );
}
