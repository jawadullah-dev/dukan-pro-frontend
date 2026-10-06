import React from 'react';
import { Heading } from '../ui/heading';
import type { InfobarContent } from '@/components/ui/infobar';
import { cn } from '@/lib/utils';

function PageSkeleton() {
  return (
    <div
      role='status'
      aria-label='Loading page'
      className='flex flex-1 animate-pulse flex-col gap-4'
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
    <div className='flex min-h-0 min-w-0 flex-1 flex-col'>
      {hasHeader ? (
        <div className='mb-3 flex shrink-0 flex-col gap-2 px-4 pt-4 sm:mb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 md:px-6 md:pt-6'>
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
      ) : null}

      <div
        className={cn(
          'flex min-h-0 min-w-0 flex-1 flex-col',
          // Padding lives on the scroll/fill pane so card rings & borders are not
          // clipped by overflow (ring draws outside the box).
          hasHeader ? 'px-4 md:px-6' : 'px-4 pt-4 md:px-6 md:pt-6',
          'pb-[max(1rem,calc(5.5rem+env(safe-area-inset-bottom)))] sm:pb-4',
          fill ? 'overflow-hidden' : 'overflow-y-auto overscroll-y-contain'
        )}
      >
        {/*
          p-px: keeps 1px ring/border of full-width cards inside the scrollport.
          Without this, overflow-y-auto clips left/right/bottom card edges.
        */}
        <div
          className={cn(
            'min-w-0 p-px',
            fill ? 'flex min-h-0 flex-1 flex-col overflow-hidden' : 'w-full'
          )}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
