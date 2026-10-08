'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Product } from '../../api/types';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import Image from 'next/image';
import { CellAction } from './cell-action';
import { CATEGORY_OPTIONS } from './options';
import { useT } from '@/i18n/use-t';

function ImageColumnHeader() {
  const t = useT();
  return <span>{t('tableColumns.image')}</span>;
}

function NameColumnHeader({ column }: { column: Column<Product, unknown> }) {
  const t = useT();
  return <DataTableColumnHeader column={column} title={t('common.name')} />;
}

function CategoryColumnHeader({ column }: { column: Column<Product, unknown> }) {
  const t = useT();
  return <DataTableColumnHeader column={column} title={t('common.category')} />;
}

function PriceColumnHeader({ column }: { column: Column<Product, unknown> }) {
  const t = useT();
  return <DataTableColumnHeader column={column} title={t('common.price')} />;
}

function DescriptionColumnHeader({ column }: { column: Column<Product, unknown> }) {
  const t = useT();
  return <DataTableColumnHeader column={column} title={t('common.description')} />;
}

export const columns: ColumnDef<Product>[] = [
  {
    id: 'photo_url',
    accessorKey: 'photo_url',
    header: () => <ImageColumnHeader />,
    cell: ({ row }) => {
      return (
        <div className='relative aspect-square'>
          <Image
            src={row.getValue('photo_url')}
            alt={row.getValue('name')}
            fill
            sizes='80px'
            className='rounded-lg'
          />
        </div>
      );
    },
    meta: { label: 'tableColumns.image', type: 'image', priority: 2 }
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <NameColumnHeader column={column} />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Product['name']>()}</div>,
    meta: {
      label: 'common.name',
      placeholderKey: 'search.products' as const,
      variant: 'text',
      icon: Icons.text,
      type: 'text',
      primary: true,
      priority: 1
    },
    enableColumnFilter: true
  },
  {
    id: 'category',
    accessorKey: 'category',
    enableSorting: false,
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <CategoryColumnHeader column={column} />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<Product['category']>();
      const Icon = status === 'active' ? Icons.circleCheck : Icons.xCircle;

      return (
        <Badge variant='outline' className='capitalize'>
          <Icon />
          {status}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'common.category',
      variant: 'multiSelect',
      options: CATEGORY_OPTIONS,
      type: 'text',
      priority: 2
    }
  },
  {
    id: 'price',
    accessorKey: 'price',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <PriceColumnHeader column={column} />
    ),
    meta: {
      label: 'common.price',
      type: 'money',
      highlight: true,
      priority: 1
    }
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DescriptionColumnHeader column={column} />
    ),
    meta: {
      label: 'common.description',
      type: 'longtext',
      priority: 4,
      mobile: 'hidden'
    }
  },
  {
    id: 'actions',
    meta: { mobile: 'hidden' },
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
