'use client';

import { TablePageBody } from '@/components/layout/table-page-body';
import { ExpenseCategoriesTable } from './expense-categories-table';

export function ExpenseCategoriesClient() {
  return (
    <TablePageBody>
      <ExpenseCategoriesTable />
    </TablePageBody>
  );
}
