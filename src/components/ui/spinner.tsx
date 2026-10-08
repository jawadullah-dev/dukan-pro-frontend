import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n/use-t';

/** Canonical loading indicator — use this for every spinner in the app. */
function Spinner({ className, ...props }: React.ComponentProps<typeof Icons.spinner>) {
  const t = useT();
  return (
    <Icons.spinner
      data-slot='spinner'
      role='status'
      aria-label={t('common.loading')}
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };
