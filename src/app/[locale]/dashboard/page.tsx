import { auth } from '@/auth';
import { homePathForRole } from '@/lib/auth/routes';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';

export default async function Dashboard() {
  const session = await auth();
  const locale = await getLocale();
  redirect(homePathForRole(session?.user?.role, locale));
}
