'use client';

import * as React from 'react';

export type ContainerMode = 'list' | 'cards' | 'compact' | 'full';

export interface ContainerModeState {
  width: number | null;
  mode: ContainerMode;
  wideCompact: boolean;
  measured: boolean;
  ref: React.RefObject<HTMLDivElement | null>;
}

const LIST_MAX = 639;
const COMPACT_MAX = 1023;
const WIDE_COMPACT_MIN = 900;

function modeFromWidth(width: number): ContainerMode {
  if (width <= LIST_MAX) return 'list';
  if (width <= COMPACT_MAX) return 'compact';
  return 'full';
}

export function useContainerMode(): ContainerModeState {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = React.useState<number | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = (next: number) => {
      setWidth((prev) => (prev === next ? prev : next));
    };

    update(el.getBoundingClientRect().width);

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      update(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const mode: ContainerMode = width == null ? 'full' : modeFromWidth(width);
  const wideCompact = width != null && width >= WIDE_COMPACT_MIN && width <= COMPACT_MAX;

  return {
    width,
    mode: width == null ? 'full' : mode,
    wideCompact,
    measured: width != null,
    ref
  };
}
