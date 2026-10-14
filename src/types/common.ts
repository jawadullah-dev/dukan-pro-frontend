import type * as React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import type { NextIntlClientProvider } from 'next-intl';
import type { IconProps } from '@tabler/icons-react';
import type { ActionId, ActionImpl } from 'kbar';

export interface AppearanceProviderProps {
  children: ReactNode;
}

export interface DialogCancelButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export type DialogPrimaryMode = 'add' | 'edit' | 'save';

export interface DialogPrimaryButtonProps {
  mode: DialogPrimaryMode;
  disabled?: boolean;
  loading?: boolean;
  type?: 'submit' | 'button';
  onClick?: () => void;
  variant?: 'default' | 'destructive';
}

export interface FloatingActionButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

export type I18nProviderProps = ComponentProps<typeof NextIntlClientProvider>;

export type Icon = React.ComponentType<IconProps>;

export interface KBarProps {
  children: ReactNode;
}

export interface KBarComponentProps {
  children: ReactNode;
}

export interface ResultItemProps {
  action: ActionImpl;
  active: boolean;
  currentRootActionId: ActionId;
}

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  closeOnOutsideClick?: boolean;
}

export type Surface = 'ios' | 'android' | 'desktop';

export interface InstallPromptProps {
  variant?: 'banner' | 'menu' | 'both';
  className?: string;
}

export interface PwaShellProps {
  children: ReactNode;
}

export interface PwaUpdateInlineProps {
  onReload: () => void;
}

export type ThemeContextType = {
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
};

export interface ActiveThemeProviderProps {
  children: ReactNode;
  initialTheme?: string;
}

export interface UseControllableStateParams<T> {
  prop?: T | undefined;
  defaultProp?: T | undefined;
  onChange?: (state: T) => void;
}

export type SetStateFn<T> = (prevState?: T) => T;

export interface SentryClientModule {
  captureRouterTransitionStart?: (href: string, navigationType: string) => void;
}

export interface ThemeTransitionOrigin {
  clientX: number;
  clientY: number;
}

export interface InstallPromptUserChoice {
  outcome: 'accepted' | 'dismissed';
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallPromptUserChoice>;
}

export interface RelatedApp {
  platform: string;
  url?: string;
  id?: string;
}

export interface NavigatorWithRelatedApps extends Navigator {
  getInstalledRelatedApps?: () => Promise<RelatedApp[]>;
}
