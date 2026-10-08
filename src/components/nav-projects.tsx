'use client';

import { Icons } from '@/components/icons';
import { useT } from '@/i18n/use-t';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { Icon } from '@/components/icons';

export function NavProjects({
  projects
}: {
  projects: {
    name: string;
    url: string;
    icon: Icon;
  }[];
}) {
  const { isMobile } = useSidebar();
  const t = useT();

  return (
    <SidebarGroup className='group-data-[collapsible=icon]:hidden'>
      <SidebarGroupLabel>{t('navProjects.projects')}</SidebarGroupLabel>
      <SidebarMenu>
        {projects.length === 0 && (
          <SidebarMenuItem>
            <p className='text-sidebar-foreground/70 px-2 py-1.5 text-xs'>
              {t('navProjects.noProjects')}
            </p>
          </SidebarMenuItem>
        )}
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton render={<a href={item.url} aria-label={item.name} />}>
              <item.icon />
              <span>{item.name}</span>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuAction showOnHover />}>
                <Icons.dots />
                <span className='sr-only'>{t('navProjects.more')}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-48 rounded-lg'
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Icons.workspace className='text-muted-foreground me-2 h-4 w-4' />
                    <span>{t('navProjects.viewProject')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Icons.share className='text-muted-foreground me-2 h-4 w-4' />
                    <span>{t('navProjects.shareProject')}</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Icons.trash className='text-muted-foreground me-2 h-4 w-4' />
                    <span>{t('navProjects.deleteProject')}</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className='text-sidebar-foreground/70'>
            <Icons.dots className='text-sidebar-foreground/70' />
            <span>{t('navProjects.more')}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
