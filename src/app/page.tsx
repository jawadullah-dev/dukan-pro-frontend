import { auth } from '@/auth';
import { homePathForRole } from '@/lib/auth/routes';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await auth();
  redirect(session?.user ? homePathForRole(session.user.role) : '/login');
}
