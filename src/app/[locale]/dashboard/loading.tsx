import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col p-4 md:p-6 space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-7 w-48' />
          <Skeleton className='h-4 w-72' />
        </div>
        <Skeleton className='h-9 w-32' />
      </div>
      <DataTableSkeleton rowCount={5} columnCount={5} />
    </div>
  );
}
