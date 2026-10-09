'use client';

import { useEffect } from 'react';
import { applyAppearancePrefs } from '@/lib/appearance/apply';
import { useAppearanceStore } from '@/lib/appearance/store';

interface AppearanceProviderProps {
  children: React.ReactNode;
}

export function AppearanceProvider({ children }: AppearanceProviderProps) {
  const density = useAppearanceStore((s) => s.density);
  const radius = useAppearanceStore((s) => s.radius);
  const accent = useAppearanceStore((s) => s.accent);
  const digits = useAppearanceStore((s) => s.digits);

  useEffect(() => {
    void useAppearanceStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    applyAppearancePrefs({ density, radius, accent, digits });
  }, [density, radius, accent, digits]);

  return <>{children}</>;
}
