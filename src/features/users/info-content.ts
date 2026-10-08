import type { InfobarContent } from '@/components/ui/infobar';

export const usersInfoContent: InfobarContent = {
  title: 'usersInfo.title',
  sections: [
    {
      title: 'infoConfig.products.sections.0.title',
      description: 'usersInfo.overviewText1',
      links: [
        {
          title: 'usersInfo.ssrDocs',
          url: 'https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr'
        }
      ]
    },
    {
      title: 'usersInfo.serverPrefetchTitle',
      description: 'usersInfo.serverPrefetchText',
      links: []
    },
    {
      title: 'usersInfo.urlStateTitle',
      description: 'usersInfo.urlStateText',
      links: [
        {
          title: 'usersInfo.nuqsDocs',
          url: 'https://nuqs.47ng.com'
        }
      ]
    },
    {
      title: 'usersInfo.patternTitle',
      description: 'usersInfo.patternComparison',
      links: []
    }
  ]
};
