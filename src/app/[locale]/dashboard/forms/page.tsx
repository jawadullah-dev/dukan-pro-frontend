import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { localize } from '@/lib/auth/routes';

export default async function Page() {
  const locale = await getLocale();
  redirect(localize('/dashboard/forms/basic', locale));
}
