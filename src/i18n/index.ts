import { en, type MessageKey } from './messages/en';
import { ur } from './messages/ur';
import { ps } from './messages/ps';

export type AppLocale = 'en' | 'ur' | 'ps';

const catalogs: Record<AppLocale, Record<MessageKey, string>> = {
  en,
  ur,
  ps
};

/** Active UI locale. Wire to appearance/settings later. */
let activeLocale: AppLocale = 'en';

export function setLocale(locale: AppLocale): void {
  activeLocale = locale;
}

export function getLocale(): AppLocale {
  return activeLocale;
}

/** Translate a key; `{name}` placeholders replaced from `vars`. */
export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  const catalog = catalogs[activeLocale] ?? en;
  let text = catalog[key] ?? en[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

export type { MessageKey };
