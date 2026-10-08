'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { IconChevronLeft, IconChevronRight, IconDots } from '@tabler/icons-react';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  const t = useTranslations();

  return (
    <nav
      aria-label={t('pagination.ariaLabel')}
      data-slot='pagination'
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot='pagination-content'
      className={cn('flex items-center gap-0.5', className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot='pagination-item' {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'a'>;

function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
  return (
    <Button
      variant={isActive ? 'outline' : 'ghost'}
      size={size}
      className={cn(className)}
      nativeButton={false}
      render={
        // oxlint-disable-next-line jsx-a11y/anchor-has-content -- link text arrives via props from Button's render composition
        <a
          aria-current={isActive ? 'page' : undefined}
          data-slot='pagination-link'
          data-active={isActive}
          {...props}
        />
      }
    />
  );
}

function PaginationPrevious({
  className,
  text,
  ariaLabel,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string; ariaLabel?: string }) {
  const t = useTranslations();

  return (
    <PaginationLink
      aria-label={ariaLabel ?? t('pagination.prevPageAria')}
      size='default'
      className={cn('ps-1.5!', className)}
      {...props}
    >
      <IconChevronLeft data-icon='inline-start' />
      <span className='hidden sm:block'>{text ?? t('pagination.previousText')}</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  text,
  ariaLabel,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string; ariaLabel?: string }) {
  const t = useTranslations();

  return (
    <PaginationLink
      aria-label={ariaLabel ?? t('pagination.nextPageAria')}
      size='default'
      className={cn('pe-1.5!', className)}
      {...props}
    >
      <span className='hidden sm:block'>{text ?? t('pagination.nextText')}</span>
      <IconChevronRight data-icon='inline-end' />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  label,
  ...props
}: React.ComponentProps<'span'> & { label?: string }) {
  const t = useTranslations();

  return (
    <span
      aria-hidden
      data-slot='pagination-ellipsis'
      className={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <IconDots />
      <span className='sr-only'>{label ?? t('pagination.morePages')}</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
};
