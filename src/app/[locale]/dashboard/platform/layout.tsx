import { auth } from '@/auth';
import { SHOP_HOME } from '@/lib/auth/routes';
import { redirect } from 'next/navigation';

interface PlatformLayoutProps {
  children: React.ReactNode;
}

export default async function PlatformLayout({ children }: PlatformLayoutProps) {
  const session = await auth();
  if (session?.user?.role !== 'SUPER_ADMIN') {
    redirect(SHOP_HOME);
  }
  return children;
}
