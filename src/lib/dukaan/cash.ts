import type { CashMovement, SoftCashWarning } from './types';
import { getStore } from './store';

export function getCashBalance(shopId: string): number {
  const movements = getStore().cash_movements.filter((m) => m.shop_id === shopId);
  return movements.reduce((sum, m) => {
    return m.direction === 'IN' ? sum + m.amount : sum - m.amount;
  }, 0);
}

export function checkSoftCashWarning(shopId: string, outflow: number): SoftCashWarning {
  const current = getCashBalance(shopId);
  const projected = current - outflow;
  return {
    needs_confirm: projected < 0,
    current_cash: current,
    amount: outflow,
    projected_cash: projected
  };
}

export function sumCashMovements(movements: CashMovement[]): number {
  return movements.reduce((sum, m) => {
    return m.direction === 'IN' ? sum + m.amount : sum - m.amount;
  }, 0);
}
