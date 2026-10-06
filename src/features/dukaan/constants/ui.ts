import { t } from '@/i18n';

/** Shared action labels for dukaan dialogs and toolbars (translated). */
export function getActionLabels() {
  return {
    add: t('common.add'),
    edit: t('common.edit'),
    save: t('common.save'),
    cancel: t('common.cancel'),
    remove: t('common.remove'),
    confirm: t('common.confirm')
  } as const;
}

/** @deprecated Prefer getActionLabels() so locale updates apply. */
export const ACTION_LABELS = {
  get add() {
    return t('common.add');
  },
  get edit() {
    return t('common.edit');
  },
  get save() {
    return t('common.save');
  },
  get cancel() {
    return t('common.cancel');
  },
  get remove() {
    return t('common.remove');
  },
  get confirm() {
    return t('common.confirm');
  }
};
