import type { ReactNode } from 'react';
import type { ChartConfig } from '@/components/ui/chart';

export interface DottedBackgroundPatternProps {
  config: ChartConfig;
}

export interface StatsErrorAlertProps {
  message: string;
  action: ReactNode;
}
