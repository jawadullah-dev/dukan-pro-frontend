'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useInfobar, type InfobarContent } from '@/components/ui/infobar';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n/use-t';

interface InfoButtonProps extends Omit<React.ComponentProps<typeof Button>, 'content'> {
  content: InfobarContent;
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  label?: string;
}

export function InfoButton({
  content,
  className,
  variant = 'ghost',
  size = 'icon',
  label,
  ...props
}: InfoButtonProps) {
  const { setContent, setOpen } = useInfobar();
  const t = useT();
  const resolvedLabel = label ?? t('infoButton.showInformation');

  // Set content on mount so the infobar has it ready, but don't force it open
  const contentRef = React.useRef(content);
  contentRef.current = content;

  React.useEffect(() => {
    setContent(contentRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick: React.ComponentProps<typeof Button>['onClick'] = (e) => {
    setContent(content);
    setOpen(true);
    props.onClick?.(e);
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn('shrink-0', className)}
      onClick={handleClick}
      aria-label={resolvedLabel}
      {...props}
    >
      <Icons.info className='h-4 w-4' />
      <span className='sr-only'>{resolvedLabel}</span>
    </Button>
  );
}
