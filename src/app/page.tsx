import { auth } from '@/auth';
import { homePathForRole, shortcutPathForRole } from '@/lib/auth/routes';
import { redirect } from 'next/navigation';

export default async function Page({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  const { to } = await searchParams;
  const shortcut = shortcutPathForRole(to, session.user.role);
  redirect(shortcut ?? homePathForRole(session.user.role));
}
