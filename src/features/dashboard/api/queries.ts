import { queryOptions } from '@tanstack/react-query';
import { getDashboardKpis, getSessionInfo } from './service';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  kpis: () => [...dashboardKeys.all, 'kpis'] as const,
  session: () => [...dashboardKeys.all, 'session'] as const
};

export const dashboardQueryOptions = () =>
  queryOptions({
    queryKey: dashboardKeys.kpis(),
    queryFn: () => getDashboardKpis()
  });

export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: dashboardKeys.session(),
    queryFn: () => getSessionInfo()
  });
