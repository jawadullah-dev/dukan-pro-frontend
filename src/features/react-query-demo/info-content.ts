import type { InfobarContent } from '@/components/ui/infobar';

export const reactQueryInfoContent: InfobarContent = {
  title: 'reactQueryInfo.title',
  sections: [
    {
      title: 'reactQueryInfo.serverPrefetchTitle',
      description: 'reactQueryInfo.serverPrefetchText',
      links: [
        {
          title: 'reactQueryInfo.ssrDocs',
          url: 'https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr'
        }
      ]
    },
    {
      title: 'reactQueryInfo.queryOptionsTitle',
      description: 'reactQueryInfo.queryOptionsText',
      links: [
        {
          title: 'reactQueryInfo.queryOptionsDocs',
          url: 'https://tanstack.com/query/latest/docs/framework/react/reference/queryOptions'
        }
      ]
    },
    {
      title: 'reactQueryInfo.suspenseTitle',
      description: 'reactQueryInfo.suspenseText',
      links: []
    },
    {
      title: 'reactQueryInfo.optimisticTitle',
      description: 'reactQueryInfo.optimisticText',
      links: [
        {
          title: 'reactQueryInfo.optimisticDocs',
          url: 'https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates'
        }
      ]
    }
  ]
};
