import en from '../../../messages/en.json';

export type MessageKey<T = typeof en> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends object
      ? `${K}.${MessageKey<T[K]>}`
      : never;
}[keyof T & string];
