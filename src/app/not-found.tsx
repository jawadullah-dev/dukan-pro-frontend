'use client';

import { useRouter } from 'next/navigation';
import { NotFoundView } from '@/components/common/not-found-view';

export default function NotFound() {
  const router = useRouter();

  return <NotFoundView onBack={() => router.back()} onHome={() => router.push('/en/dashboard')} />;
}
