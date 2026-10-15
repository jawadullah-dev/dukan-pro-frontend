export interface ExpenseDTO {
  id: string;
  shopId: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  expenseDate: string;
  description: string | null;
  status: 'ACTIVE' | 'CANCELLED';
  cancelledAt: string | null;
  cancelReason: string | null;
  cancelledById: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCategoryDTO {
  id: string;
  shopId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseInput {
  categoryId: string;
  amount: number;
  expenseDate: string;
  description?: string;
  confirmOverdraft?: boolean;
}

export interface ExpenseOverdraftPrompt {
  confirmOverdraft: true;
  shortfall: number;
  message: string;
}

export interface ExpenseSuccessResult {
  status: boolean;
  message: string;
  confirmOverdraft?: false;
}

export type CreateExpenseResult = ExpenseSuccessResult | ExpenseOverdraftPrompt;

export interface CancelExpenseInput {
  cancelReason: string;
}

export interface CancelExpenseResult {
  status: boolean;
  message: string;
}

export interface ExpenseQueryFilter {
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: 'ACTIVE' | 'CANCELLED';
  from?: string;
  to?: string;
  sortBy?: 'expenseDate' | 'amount' | 'createdAt' | 'categoryName' | 'description' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateExpenseCategoryInput {
  name: string;
  isActive?: boolean;
}

export type ExpenseCategorySortField = 'name' | 'createdAt' | 'updatedAt';

export interface ExpenseCategoryQueryFilter {
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: ExpenseCategorySortField;
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateExpenseCategoryInput {
  name?: string;
  isActive?: boolean;
}

export interface ExpenseCategoryStatusResult {
  status: boolean;
  message: string;
}

export interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated?: (category: ExpenseCategoryDTO) => void;
}

export interface CancelExpenseDialogProps {
  expense: ExpenseDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

import type { EntityComboboxItem } from './common';

export interface CategoryComboboxItem extends EntityComboboxItem {
  raw: ExpenseCategoryDTO;
}

export interface CategorySelectComboboxProps {
  value: string;
  onSelectCategory: (category: ExpenseCategoryDTO | null) => void;
  selectedCategory?: ExpenseCategoryDTO | null;
  placeholder?: string;
  disabled?: boolean;
  onAddNewCategoryClick?: () => void;
}

export interface ExpenseCategoryCellActionProps {
  category: ExpenseCategoryDTO;
  onEdit: (category: ExpenseCategoryDTO) => void;
  onDeactivate: (category: ExpenseCategoryDTO) => void;
  onActivate: (category: ExpenseCategoryDTO) => void;
  isActivating: boolean;
}

export interface ExpenseCategoriesTableProps {
  toolbarAction?: React.ReactNode;
}

export interface ExpenseCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ExpenseCategoryDTO | null;
  onCategoryCreated?: (category: ExpenseCategoryDTO) => void;
}

export interface ExpenseCategoryDialogBodyProps {
  category?: ExpenseCategoryDTO | null;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated?: (category: ExpenseCategoryDTO) => void;
}

export interface ExpenseDetailSheetProps {
  expense: ExpenseDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelClick?: (expense: ExpenseDTO) => void;
}

export interface ExpenseRowActionsProps {
  expense: ExpenseDTO;
  onCancel: (expense: ExpenseDTO) => void;
}

export interface ExpensesTableProps {
  toolbarAction?: React.ReactNode;
}

export interface RecordExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategoryId?: string;
  onSuccess?: () => void;
}

export interface CancelExpenseMutationVariables {
  id: string;
  input: CancelExpenseInput;
}

export interface UpdateExpenseCategoryMutationVariables {
  id: string;
  input: UpdateExpenseCategoryInput;
}
