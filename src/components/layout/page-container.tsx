import React from 'react';
import { Heading } from '../ui/heading';
import type { InfobarContent } from '@/components/ui/infobar';
import { cn } from '@/lib/utils';

function PageSkeleton() {
  return (
    <div
      role='status'
      aria-label='Loading page'
      className='flex flex-1 animate-pulse flex-col gap-4 p-4 md:px-6'
    >
      <div className='flex items-center justify-between'>
        <div>
          <div className='bg-muted mb-2 h-8 w-48 rounded' />
          <div className='bg-muted h-4 w-96 rounded' />
        </div>
      </div>
      <div className='bg-muted mt-6 h-40 w-full rounded-lg' />
      <div className='bg-muted h-40 w-full rounded-lg' />
    </div>
  );
}

export default function PageContainer({
  children,
  isLoading = false,
  access = true,
  accessFallback,
  pageTitle,
  pageDescription,
  infoContent,
  pageHeaderAction,
  /**
   * When true, children fill remaining height (no page scroll).
   * Use for mobile table/list screens so only the table body scrolls.
   */
  fill = false
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  access?: boolean;
  accessFallback?: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  infoContent?: InfobarContent;
  pageHeaderAction?: React.ReactNode;
  fill?: boolean;
}) {
  if (!access) {
    return (
      <div role='status' className='flex flex-1 items-center justify-center p-4 md:px-6'>
        {accessFallback ?? (
          <div className='text-muted-foreground text-center text-lg'>
            You do not have access to this page.
          </div>
        )}
      </div>
    );
  }

  const content = isLoading ? <PageSkeleton /> : children;

  const hasHeader = pageTitle || pageHeaderAction;

  return (
    <div
      className={cn(
        'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-4 pt-2 md:px-6 md:pt-4',
        // Bottom clearance for fixed mobile nav / FAB — kept on the shell so
        // the inner list scroller can use the remaining height cleanly.
        'pb-[max(1rem,calc(5.5rem+env(safe-area-inset-bottom)))] sm:pb-4'
      )}
    >
      {hasHeader && (
        <div className='mb-3 flex shrink-0 flex-col gap-2 sm:mb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
          {/* Phones already show the title in the top bar — avoid duplicate H1. */}
          <div className='hidden sm:block'>
            <Heading
              title={pageTitle ?? ''}
              description={pageDescription ?? ''}
              infoContent={infoContent}
            />
          </div>
          {pageDescription ? (
            <p className='text-muted-foreground text-xs sm:hidden'>{pageDescription}</p>
          ) : null}
          {pageHeaderAction ? (
            <div className='hidden w-full shrink-0 sm:block sm:w-auto'>{pageHeaderAction}</div>
          ) : null}
        </div>
      )}
      <div
        className={cn(
          'flex min-h-0 min-w-0 flex-1 flex-col',
          fill ? 'overflow-hidden' : 'overflow-y-auto overscroll-y-contain'
        )}
      >
        {content}
      </div>
    </div>
  );
}
