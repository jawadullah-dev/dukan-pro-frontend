import { auth } from '@/auth';
import { SHOP_HOME } from '@/lib/auth/routes';
import { redirect } from 'next/navigation';

/** Platform area — only super admin. */
export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== 'SUPER_ADMIN') {
    redirect(SHOP_HOME);
  }
  return children;
}
