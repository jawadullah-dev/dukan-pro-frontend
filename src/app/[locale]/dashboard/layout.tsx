import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '@/auth';
import type { SessionRole } from '@/lib/dukaan/session';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { localize } from '@/lib/auth/routes';
import { isRtlLocale, type AppLocale } from '@/i18n/request';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('dukaanPro'),
    description: t('mobileShopManagement'),
    robots: {
      index: false,
      follow: false
    }
  };
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations();
  if (!session?.user) {
    redirect(localize('/login', locale));
  }

  const role = (session.user.role ?? 'OWNER') as SessionRole;
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <a
          href='#main-content'
          className='bg-background ring-ring sr-only rounded-md px-3 py-2 text-sm font-medium shadow focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 focus:ring-2'
        >
          {t('aria.skipToContent')}
        </a>
        <AppSidebar role={role} />
        <SidebarInset
          id='main-content'
          tabIndex={-1}
          className='flex h-dvh max-h-dvh min-h-0 min-w-0 flex-col overflow-x-clip overflow-y-hidden scroll-mt-16'
        >
          <Header />
          <InfobarProvider
            defaultOpen={false}

            className='min-h-0 flex-1'
          >
            {children}
            <InfoSidebar side={isRtlLocale(locale as AppLocale) ? 'left' : 'right'} />
          </InfobarProvider>
          <MobileBottomNav role={role} />
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
