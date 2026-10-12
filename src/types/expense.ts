export interface ExpenseDTO {
  id: string;
  shopId: string;
  categoryId: string;
  categoryName: string;
  amount: number; // in PAISA
  expenseDate: string; // YYYY-MM-DD
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
  amount: number; // in PAISA
  expenseDate: string; // YYYY-MM-DD
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
