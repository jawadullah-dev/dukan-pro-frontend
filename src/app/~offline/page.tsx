import Link from 'next/link';
import { APP_NAME } from '@/config/site';

export const metadata = {
  title: `Offline · ${APP_NAME}`,
  robots: { index: false, follow: false }
};

/** Branded offline fallback — precached by the service worker. */
export default function OfflinePage() {
  return (
    <main className='bg-background text-foreground flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center'>
      <div className='bg-muted flex size-16 items-center justify-center rounded-2xl'>
        <span className='text-2xl font-bold' aria-hidden>
          ∅
        </span>
      </div>
      <h1 className='text-xl font-semibold'>You are offline</h1>
      <p className='text-muted-foreground max-w-sm text-sm'>
        {APP_NAME} needs an internet connection for shop data. Check your network, then try again.
        Selling and saving while offline are not available in this version.
      </p>
      <a
        href='/'
        className='bg-primary text-primary-foreground inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-medium'
      >
        Try again
      </a>
      <Link
        href='/login'
        className='text-muted-foreground text-xs underline-offset-2 hover:underline'
      >
        Go to login
      </Link>
    </main>
  );
}
