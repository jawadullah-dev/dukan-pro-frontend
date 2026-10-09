'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { setRuntimeSession } from '@/lib/dukaan/session';
import { toDukaanSession } from '@/lib/auth/session-map';

interface AuthSessionBridgeProps {
  children: React.ReactNode;
}

function AuthSessionBridge({ children }: AuthSessionBridgeProps) {
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

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <AuthSessionBridge>{children}</AuthSessionBridge>
    </SessionProvider>
  );
}
