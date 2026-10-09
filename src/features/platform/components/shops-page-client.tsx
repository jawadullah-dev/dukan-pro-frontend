'use client';

import { FloatingActionButton } from '@/components/common/floating-action-button';
import { TablePageBody } from '@/components/layout/table-page-body';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/use-t';
import { PlatformShopsTable } from './shops-table';

export function CreateShopHeaderAction() {
  const t = useT();
  return (
    <Button type='button'>
      <Icons.add className='me-2 h-4 w-4' />
      {t('nav.createNewShop')}
    </Button>
  );
}

export function PlatformShopsListClient() {
  const t = useT();
  return (
    <TablePageBody>
      <PlatformShopsTable />

      <FloatingActionButton label={t('nav.createNewShop')} onClick={() => {}} />
    </TablePageBody>
  );
}
