'use client';

import { TablePageBody } from '@/components/layout/table-page-body';
import { InventoryTable } from './inventory-table';
import { AdjustmentsTable } from './adjustments-table';

export function InventoryListClient() {
  return (
    <TablePageBody>
      <InventoryTable />
    </TablePageBody>
  );
}

export function StockAdjustmentsClient() {
  return (
    <TablePageBody>
      <AdjustmentsTable />
    </TablePageBody>
  );
}

export function InventoryMovementsClient() {
  return (
    <TablePageBody>
      <AdjustmentsTable />
    </TablePageBody>
  );
}
