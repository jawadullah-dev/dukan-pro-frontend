import { dukaan } from '@/lib/dukaan';

export async function getDashboardKpis() {
  return dukaan.getDashboardKpis();
}

export async function getSessionInfo() {
  return dukaan.getSessionInfo();
}
