'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { StatusBadge } from './status-badge';
import type { MobileItemConfig } from './types';

interface MobileListItemProps<TData> {
  row: TData;
  config: MobileItemConfig<TData>;
  onOpen: () => void;
  actionsSlot?: React.ReactNode;
}

function initials(text: string): string {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

/** Two-line list row with fixed slots (title / subtitle / badge / value). */
export function MobileListItem<TData>({
  row,
  config,
  onOpen,
  actionsSlot
}: MobileListItemProps<TData>) {
  const title = config.title(row);
  const subtitle = config.subtitle?.(row);
  const badge = config.badge?.(row);
  const value = config.value?.(row);
  const valueLabel =
    typeof config.valueLabel === 'function' ? config.valueLabel(row) : config.valueLabel;
  const metaItems = (config.meta ?? [])
    .map((fn) => fn(row))
    .filter((node) => node != null && node !== false && node !== '');
  const aria = config.ariaLabel?.(row) ?? (typeof title === 'string' ? title : undefined);

  const LeadingIcon = config.leadingIcon ?? Icons.box;

  return (
    <div className='relative flex min-h-16 items-stretch gap-2 px-3 py-2.5'>
      <button
        type='button'
        onClick={onOpen}
        aria-label={aria}
        className={cn(
          'flex min-w-0 flex-1 items-start gap-3 text-start',
          'rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
        )}
      >
        {config.leading === 'avatar' ? (
          <Avatar className='size-10 shrink-0'>
            <AvatarFallback className='bg-muted text-muted-foreground text-xs font-medium'>
              {initials(typeof title === 'string' ? title : String(aria ?? ''))}
            </AvatarFallback>
          </Avatar>
        ) : config.leading === 'icon' || config.leading === 'thumbnail' ? (
          <div className='bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg'>
            <LeadingIcon className='size-5' />
          </div>
        ) : null}

        <div className='min-w-0 flex-1'>
          <div className='flex min-w-0 items-start justify-between gap-3'>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-semibold'>{title}</p>
              {subtitle != null ? (
                <p className='text-muted-foreground truncate text-xs'>{subtitle}</p>
              ) : null}
              {(metaItems.length > 0 || badge) && (
                <div className='mt-1 flex min-w-0 flex-wrap items-center gap-1.5'>
                  {metaItems.slice(0, 2).map((item, i) => (
                    <span key={i} className='text-muted-foreground text-[11px]'>
                      {i > 0 ? <span className='me-1.5'>·</span> : null}
                      {item}
                    </span>
                  ))}
                  {badge ? (
                    <StatusBadge
                      status={badge.status ?? badge.label}
                      label={badge.label}
                      tone={badge.tone}
                    />
                  ) : null}
                </div>
              )}
            </div>

            {value != null ? (
              <div className='ms-1 w-[5.5rem] shrink-0 text-end sm:w-24'>
                <p
                  className={cn(
                    'truncate text-sm font-semibold tabular-nums',
                    config.valueClassName?.(row)
                  )}
                >
                  {value}
                </p>
                {valueLabel ? (
                  <p className='text-muted-foreground truncate text-[10px]'>{valueLabel}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </button>

      {actionsSlot ? (
        <div className='flex shrink-0 items-center self-center'>{actionsSlot}</div>
      ) : null}
    </div>
  );
}
