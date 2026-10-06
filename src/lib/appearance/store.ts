'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppearanceDensity = 'comfortable' | 'compact';
export type AppearanceRadius = 'sharp' | 'medium' | 'round';
export type AppearanceAccent = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal';
export type AppearanceLanguage = 'en' | 'ur' | 'ps';
export type AppearanceDigits = 'western' | 'eastern';

export interface AppearanceState {
  density: AppearanceDensity;
  radius: AppearanceRadius;
  accent: AppearanceAccent;
  language: AppearanceLanguage;
  digits: AppearanceDigits;
  setDensity: (density: AppearanceDensity) => void;
  setRadius: (radius: AppearanceRadius) => void;
  setAccent: (accent: AppearanceAccent) => void;
  setLanguage: (language: AppearanceLanguage) => void;
  setDigits: (digits: AppearanceDigits) => void;
  resetAll: () => void;
}

export const DEFAULT_APPEARANCE = {
  density: 'comfortable' as AppearanceDensity,
  radius: 'medium' as AppearanceRadius,
  accent: 'red' as AppearanceAccent,
  language: 'en' as AppearanceLanguage,
  digits: 'western' as AppearanceDigits
};

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      ...DEFAULT_APPEARANCE,
      setDensity: (density) => set({ density }),
      setRadius: (radius) => set({ radius }),
      setAccent: (accent) => set({ accent }),
      setLanguage: (language) => set({ language }),
      setDigits: (digits) => set({ digits }),
      resetAll: () => set({ ...DEFAULT_APPEARANCE })
    }),
    {
      name: 'dukaan-appearance:v2',
      skipHydration: true
    }
  )
);
