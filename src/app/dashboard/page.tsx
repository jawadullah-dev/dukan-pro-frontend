import { auth } from '@/auth';
import { homePathForRole } from '@/lib/auth/routes';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await auth();
  redirect(homePathForRole(session?.user?.role));
}
