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

export type IdKeyed = { id: string };

export type OverdraftAlertVariant = 'compact' | 'banner';

export interface OverdraftAlertProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  variant?: OverdraftAlertVariant;
  id?: string;
  className?: string;
}

export interface PresetReasonPillsProps {
  reasons: readonly string[] | string[];
  onSelect: (reason: string) => void;
  className?: string;
}

export interface CancelImpactItem {
  label: string;
  value: ReactNode;
  divider?: boolean;
  highlight?: boolean;
  success?: boolean;
  destructive?: boolean;
}

export interface BaseCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  isBlocked?: boolean;
  blockedTitle?: string;
  blockedReason?: string;
  closeLabel?: string;
  isLoadingImpact?: boolean;
  loadingImpactText?: string;
  impactItems?: CancelImpactItem[];
  overdraftAlert?: ReactNode;
  presetReasons?: readonly string[] | string[];
  reason: string;
  onReasonChange: (reason: string) => void;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  reasonId?: string;
  reasonCharactersCountText?: string;
  quickSelectReasonText?: string;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  cancelButtonText?: string;
  submitButtonText?: string;
}

export interface EntityComboboxItem {
  id: string;
  label: string;
  subLabel?: string;
}

export interface EntityComboboxProps<T extends EntityComboboxItem = EntityComboboxItem> {
  value?: string;
  items: T[];
  selectedItem?: T | null;
  onSelect: (item: T | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  search: string;
  onSearchChange: (search: string) => void;
  isLoading?: boolean;
  loadingText?: string;
  emptyText?: string;
  clearSelectionTitle?: string;
  disabled?: boolean;
  className?: string;
  renderTriggerLeading?: ReactNode;
  onAddNewClick?: () => void;
  addNewLabel?: string;
}

export interface HasStatusRecord {
  status: string;
}

export interface HasAmountRecord {
  amount: number;
}

export interface HasIsActiveRecord {
  isActive: boolean;
}

export interface NamedActiveItem {
  name: string;
  isActive: boolean;
}

export interface NamedEntityItem {
  id: string;
  name: string;
}

export interface SimpleEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity?: NamedEntityItem | null;
  titleAdd: string;
  titleEdit: string;
  descriptionAdd: string;
  descriptionEdit: string;
  nameLabel: string;
  namePlaceholder: string;
  successCreated: string;
  successUpdated: string;
  onSave: (id: string | undefined, name: string) => Promise<unknown>;
  invalidateQueryKey: readonly unknown[];
  schema?: unknown;
}

export interface SimpleEntityDialogBodyProps extends SimpleEntityDialogProps {}

export interface SimpleEntityCellActionProps {
  id: string;
  deleteTitle: string;
  deleteDescription: string;
  deleteSuccess: string;
  onDelete: (id: string) => Promise<unknown>;
  invalidateQueryKey: readonly unknown[];
  renderDialog: (open: boolean, onOpenChange: (open: boolean) => void) => ReactNode;
}

export interface NotFoundViewProps {
  onBack: () => void;
  onHome: () => void;
}

export interface DateFieldShellProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  isInvalid: boolean;
  errors?: unknown[];
  hasValue: boolean;
  displayText: ReactNode;
  children: ReactNode;
}
