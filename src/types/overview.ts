import type * as React from 'react';
import type { ReactNode } from 'react';
import type { ChartConfig } from '@/components/ui/chart';

export interface CustomHatchedBarProps extends React.SVGProps<SVGRectElement> {
  dataKey?: string;
  isHatched?: boolean;
}

export interface DottedBackgroundPatternProps {
  config: ChartConfig;
}

export interface StatsErrorAlertProps {
  message: string;
  action: ReactNode;
}

export interface StatsErrorFallbackProps {
  error: Error;
  reset: () => void;
  message: string;
}
