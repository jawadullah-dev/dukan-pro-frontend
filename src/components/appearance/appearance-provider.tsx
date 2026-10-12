'use client';

import { useEffect, useLayoutEffect } from 'react';
import { applyAppearancePrefs } from '@/lib/appearance/apply';
import { useAppearanceStore } from '@/lib/appearance/store';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface AppearanceProviderProps {
  children: React.ReactNode;
}

export function AppearanceProvider({ children }: AppearanceProviderProps) {
  const density = useAppearanceStore((s) => s.density);
  const radius = useAppearanceStore((s) => s.radius);
  const accent = useAppearanceStore((s) => s.accent);
  const digits = useAppearanceStore((s) => s.digits);

  useIsomorphicLayoutEffect(() => {
    applyAppearancePrefs({ density, radius, accent, digits });
  }, [density, radius, accent, digits]);

  return <>{children}</>;
}
