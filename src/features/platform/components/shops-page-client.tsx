'use client';

import { FloatingActionButton } from '@/components/common/floating-action-button';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { PlatformShopsTable } from './shops-table';

/** Desktop/tablet header action (pageHeaderAction is hidden on phones). */
export function CreateShopHeaderAction() {
  return (
    <Button type='button'>
      <Icons.add className='me-2 h-4 w-4' />
      Create New Shop
    </Button>
  );
}

export function PlatformShopsListClient() {
  return (
    <>
      <PlatformShopsTable />
      {/* Create-shop dialog not wired yet — FAB mirrors header affordance on phones. */}
      <FloatingActionButton label='Create New Shop' onClick={() => {}} />
    </>
  );
}
