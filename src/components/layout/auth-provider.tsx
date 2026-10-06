'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { setRuntimeSession } from '@/lib/dukaan/session';
import { toDukaanSession } from '@/lib/auth/session-map';

function AuthSessionBridge({ children }: { children: React.ReactNode }) {
  const { data } = useSession();

  useEffect(() => {
    if (data?.user) {
      setRuntimeSession(toDukaanSession(data));
      return;
    }
    setRuntimeSession(null);
  }, [data]);

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthSessionBridge>{children}</AuthSessionBridge>
    </SessionProvider>
  );
}
