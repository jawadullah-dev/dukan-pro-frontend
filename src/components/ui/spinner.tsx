import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

/** Canonical loading indicator — use this for every spinner in the app. */
function Spinner({ className, ...props }: React.ComponentProps<typeof Icons.spinner>) {
  return (
    <Icons.spinner
      data-slot='spinner'
      role='status'
      aria-label='Loading'
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };
