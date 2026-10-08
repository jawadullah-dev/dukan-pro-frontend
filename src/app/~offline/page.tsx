import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { APP_NAME } from '@/config/site';

export const metadata = {
  title: `Offline · ${APP_NAME}`,
  robots: { index: false, follow: false }
};

/** Branded offline fallback — precached by the service worker. */
export default async function OfflinePage() {
  const t = await getTranslations('offlinePage');
  const title = t('title');
  const description = t('description', { appName: APP_NAME });
  const tryAgain = t('tryAgain');
  const goToLogin = t('goToLogin');

  return (
    <main className='bg-background text-foreground flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center'>
      <div className='bg-muted flex size-16 items-center justify-center rounded-2xl'>
        <span className='text-2xl font-bold' aria-hidden>
          ∅
        </span>
      </div>
      <h1 className='text-xl font-semibold'>{title}</h1>
      <p className='text-muted-foreground max-w-sm text-sm'>{description}</p>
      <a
        href='/'
        className='bg-primary text-primary-foreground inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-medium'
      >
        {tryAgain}
      </a>
      <Link
        href='/login'
        className='text-muted-foreground text-xs underline-offset-2 hover:underline'
      >
        {goToLogin}
      </Link>
    </main>
  );
}
