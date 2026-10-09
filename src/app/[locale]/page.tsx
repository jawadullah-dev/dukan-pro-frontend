import { auth } from '@/auth';
import { homePathForRole, shortcutPathForRole, localize } from '@/lib/auth/routes';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';

interface RootPageProps {
  searchParams: Promise<{ to?: string }>;
}

export default async function Page({ searchParams }: RootPageProps) {
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) {
    redirect(localize('/login', locale));
  }
  const { to } = await searchParams;
  const shortcut = shortcutPathForRole(to, session.user.role, locale);
  redirect(shortcut ?? homePathForRole(session.user.role, locale));
}
