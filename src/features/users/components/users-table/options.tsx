import { useT } from '@/i18n/use-t';

export const ROLE_OPTIONS = (t: (key: string) => string) => [
  { value: 'Developer', label: t('roles.developer') },
  { value: 'Designer', label: t('roles.designer') },
  { value: 'Manager', label: t('roles.manager') },
  { value: 'QA', label: t('roles.qa') },
  { value: 'DevOps', label: t('roles.devops') },
  { value: 'Product Owner', label: t('roles.productOwner') }
];
