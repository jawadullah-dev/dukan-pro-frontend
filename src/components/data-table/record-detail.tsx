'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './status-badge';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { DetailConfig, RecordDetailProps } from './types';

export function RecordDetail<TData>({
  open,
  onOpenChange,
  presentation,
  data,
  detail
}: RecordDetailProps<TData>) {
  const t = useTranslations();
  if (!data) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side={presentation === 'side' ? 'right' : 'bottom'} />
      </Sheet>
    );
  }

  const title = detail.title(data);
  const badge = detail.badge?.(data);
  const value = detail.value?.(data);
  const sections = detail.sections(data);
  const actions = detail.actions?.(data) ?? [];
  const side = presentation === 'side' ? 'right' : 'bottom';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          'flex flex-col gap-0',
          presentation === 'sheet' &&
            'max-h-[85dvh] rounded-t-[var(--radius)] pb-[max(1rem,env(safe-area-inset-bottom))]',
          presentation === 'side' && 'w-full sm:max-w-md'
        )}
      >
        {presentation === 'sheet' ? (
          <div className='bg-muted mx-auto mt-1 mb-2 h-1 w-10 shrink-0 rounded-full' aria-hidden />
        ) : null}

        <SheetHeader className='border-b border-border'>
          <SheetTitle className='pe-8'>{title}</SheetTitle>
          <SheetDescription className='sr-only'>{t('table.details')}</SheetDescription>
          <div className='flex flex-wrap items-center gap-2 pt-1'>
            {badge ? (
              <StatusBadge
                status={badge.status ?? badge.label}
                label={badge.label}
                tone={badge.tone}
              />
            ) : null}
            {value != null ? (
              <span className='text-base font-semibold tabular-nums'>{value}</span>
            ) : null}
          </div>
        </SheetHeader>

        <div className='no-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4'>
          {sections.map((section, si) => (
            <section key={si} className='space-y-2'>
              {section.title ? (
                <h3 className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>
                  {section.title}
                </h3>
              ) : null}
              <dl className='space-y-3'>
                {section.fields.map((field, fi) => (
                  <div key={fi} className='grid gap-0.5'>
                    <dt className='text-muted-foreground text-xs'>
                      {typeof field.label === 'function' ? field.label(data) : field.label}
                    </dt>
                    <dd className='text-sm break-words'>
                      {typeof field.value === 'function' ? field.value(data) : (field.value ?? '—')}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        {actions.length > 0 ? (
          <SheetFooter className='gap-2 border-t border-border px-4 py-3'>
            {actions.map((action) => (
              <Button
                key={action.label}
                type='button'
                variant={action.variant ?? 'default'}
                className='h-11 w-full'
                onClick={() => {
                  action.onClick();
                  onOpenChange(false);
                }}
              >
                {action.label}
              </Button>
            ))}
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
