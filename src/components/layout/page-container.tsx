import React from 'react';
import { Heading } from '../ui/heading';
import type { InfobarContent } from '@/components/ui/infobar';

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
  pageHeaderAction
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  access?: boolean;
  accessFallback?: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  infoContent?: InfobarContent;
  pageHeaderAction?: React.ReactNode;
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
    <div className='flex min-w-0 flex-1 flex-col px-4 pt-2 pb-[max(1rem,calc(5.5rem+env(safe-area-inset-bottom)))] sm:pb-4 md:px-6 md:pt-4'>
      {hasHeader && (
        <div className='mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
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
      {content}
    </div>
  );
}
