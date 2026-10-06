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

export const metadata: Metadata = {
  title: 'Dukaan Pro',
  description: 'Mobile shop management dashboard',
  robots: {
    index: false,
    follow: false
  }
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
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
          Skip to content
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
            // Row layout: page + info sidebar. min-h-0 lets the page scroll pane size correctly.
            // Avoid overflow-hidden here — it clips card rings/borders at the edges.
            className='min-h-0 flex-1'
          >
            {children}
            <InfoSidebar side='right' />
          </InfobarProvider>
          <MobileBottomNav role={role} />
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
