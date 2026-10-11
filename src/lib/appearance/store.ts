'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppearanceDensity = 'comfortable' | 'compact';
export type AppearanceRadius = 'sharp' | 'medium' | 'round';
export type AppearanceAccent = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal';
export type AppearanceDigits = 'western' | 'eastern';

export interface AppearanceState {
  density: AppearanceDensity;
  radius: AppearanceRadius;
  accent: AppearanceAccent;
  digits: AppearanceDigits;
  setDensity: (density: AppearanceDensity) => void;
  setRadius: (radius: AppearanceRadius) => void;
  setAccent: (accent: AppearanceAccent) => void;
  setDigits: (digits: AppearanceDigits) => void;
  resetAll: () => void;
}

export const DEFAULT_APPEARANCE = {
  density: 'comfortable' as AppearanceDensity,
  radius: 'medium' as AppearanceRadius,
  accent: 'red' as AppearanceAccent,
  digits: 'western' as AppearanceDigits
};

function getInitialAppearance() {
  if (typeof window === 'undefined') return DEFAULT_APPEARANCE;
  try {
    const raw = localStorage.getItem('dukaan-appearance:v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state) {
        return {
          ...DEFAULT_APPEARANCE,
          ...parsed.state
        };
      }
    }
  } catch {}
  return DEFAULT_APPEARANCE;
}

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      ...getInitialAppearance(),
      setDensity: (density) => set({ density }),
      setRadius: (radius) => set({ radius }),
      setAccent: (accent) => set({ accent }),
      setDigits: (digits) => set({ digits }),
      resetAll: () => set({ ...DEFAULT_APPEARANCE })
    }),
    {
      name: 'dukaan-appearance:v2'
    }
  )
);
