import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function RecentSalesSkeleton() {
  return (
    <Card className='h-full'>
      <CardHeader>
        <Skeleton className='h-6 w-[140px]' />
        <Skeleton className='h-4 w-[180px]' />
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex items-center'>
              <Skeleton className='h-9 w-9 rounded-full' />
              <div className='ms-4 space-y-1'>
                <Skeleton className='h-4 w-[120px]' />
                <Skeleton className='h-4 w-[160px]' />
              </div>
              <Skeleton className='ms-auto h-4 w-[80px]' />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
