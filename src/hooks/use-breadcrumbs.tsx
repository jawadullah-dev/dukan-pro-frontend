'use client';

import { usePathname } from '@/i18n/navigation';
import { useMemo } from 'react';
import { useT } from '@/i18n/use-t';
import { pageTitleKeyFromPath } from '@/lib/i18n/path-titles';

type BreadcrumbItem = {
  title: string;
  link: string;
};

export function useBreadcrumbs() {
  const pathname = usePathname();
  const t = useT();

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);

    const customKey = pageTitleKeyFromPath(pathname);
    const lastTitle = customKey
      ? (() => {
          try {
            return t(customKey);
          } catch {
            return null;
          }
        })()
      : null;

    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      const isLast = index === segments.length - 1;

      if (isLast && lastTitle) {
        return { title: lastTitle, link: path };
      }

      const segKey = pageTitleKeyFromPath(`/${segments.slice(0, index + 1).join('/')}`);
      if (segKey) {
        try {
          return { title: t(segKey), link: path };
        } catch {
          // fall through to default
        }
      }

      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link: path
      };
    });
  }, [pathname, t]);

  return breadcrumbs;
}
