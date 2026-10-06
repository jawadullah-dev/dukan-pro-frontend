'use client';

import { useEffect } from 'react';
import { applyAppearancePrefs } from '@/lib/appearance/apply';
import { useAppearanceStore } from '@/lib/appearance/store';

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const density = useAppearanceStore((s) => s.density);
  const radius = useAppearanceStore((s) => s.radius);
  const accent = useAppearanceStore((s) => s.accent);
  const language = useAppearanceStore((s) => s.language);
  const digits = useAppearanceStore((s) => s.digits);

  useEffect(() => {
    void useAppearanceStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    applyAppearancePrefs({ density, radius, accent, language, digits });
  }, [density, radius, accent, language, digits]);

  return <>{children}</>;
}
