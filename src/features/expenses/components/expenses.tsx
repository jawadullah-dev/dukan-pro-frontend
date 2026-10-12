'use client';

import { TablePageBody } from '@/components/layout/table-page-body';
import { ExpensesTable } from './expenses-table';

export function ExpensesClient() {
  return (
    <TablePageBody>
      <ExpensesTable />
    </TablePageBody>
  );
}
