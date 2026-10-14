import en from '../../messages/en.json';
import ur from '../../messages/ur.json';
import ps from '../../messages/ps.json';

export type LegacyLocale = 'en' | 'ur' | 'ps';

const catalogs: Record<LegacyLocale, Record<string, unknown>> = { en, ur, ps };
let activeLocale: LegacyLocale = 'en';

export function setLocale(locale: string): void {
  if (locale === 'en' || locale === 'ur' || locale === 'ps') {
    activeLocale = locale;
  }
}

export function getLocale(): LegacyLocale {
  if (typeof window !== 'undefined') {
    const match = window.location.pathname.match(/^\/(en|ur|ps)(\/|$)/);
    if (match) return match[1] as LegacyLocale;
    const lang = document.documentElement.lang;
    if (lang === 'ur' || lang === 'ps' || lang === 'en') return lang as LegacyLocale;
  }
  return activeLocale;
}

function getMessage(catalog: Record<string, unknown>, key: string): string | undefined {
  if (!key) return undefined;
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
  if (!key) return '';
  const currentLocale = getLocale();
  const catalog = catalogs[currentLocale] ?? catalogs.en;

  let text =
    getMessage(catalog, key) ??
    (key.startsWith('common.') ? getMessage(catalog, key.slice(7)) : undefined) ??
    (!key.includes('.') ? getMessage(catalog, `common.${key}`) : undefined) ??
    getMessage(catalogs.en, key) ??
    (key.startsWith('common.') ? getMessage(catalogs.en, key.slice(7)) : undefined) ??
    (!key.includes('.') ? getMessage(catalogs.en, `common.${key}`) : undefined);

  if (!text) {
    if (key.startsWith('common.')) {
      const seg = key.slice(7);
      text = seg.charAt(0).toUpperCase() + seg.slice(1);
    } else {
      text = key;
    }
  }

  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}
