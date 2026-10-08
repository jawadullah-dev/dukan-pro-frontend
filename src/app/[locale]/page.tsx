import { auth } from '@/auth';
import { homePathForRole, shortcutPathForRole, localize } from '@/lib/auth/routes';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';

export default async function Page({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) {
    redirect(localize('/login', locale));
  }
  const { to } = await searchParams;
  const shortcut = shortcutPathForRole(to, session.user.role, locale);
  redirect(shortcut ?? homePathForRole(session.user.role, locale));
}
