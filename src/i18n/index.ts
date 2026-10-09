export * from './request';
export * from './use-t';

import en from '../../messages/en.json';
import ur from '../../messages/ur.json';
import ps from '../../messages/ps.json';

type LegacyLocale = 'en' | 'ur' | 'ps';

const catalogs = { en, ur, ps } satisfies Record<LegacyLocale, object>;
let activeLocale: LegacyLocale = 'en';

function setLocale(locale: LegacyLocale): void {
  activeLocale = locale;
}

function getLocale(): LegacyLocale {
  return activeLocale;
}

function getMessage(catalog: object, key: string): string | undefined {
  let value: unknown = catalog;

  for (const segment of key.split('.')) {
    if (typeof value !== 'object' || value === null || !(segment in value)) {
      return undefined;
    }
    value = (value as Record<string, unknown>)[segment];
  }

  return typeof value === 'string' ? value : undefined;
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const catalog = catalogs[activeLocale] ?? en;
  let text = getMessage(catalog, key) ?? getMessage(en, key) ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}
