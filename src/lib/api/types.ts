export interface ApiSuccessResponse<T> {
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ---------------------------------------------------------------------------
// Domain DTOs — shapes returned by the NestJS backend (camelCase)
// ---------------------------------------------------------------------------

/** Matches the BrandResponseDto from the NestJS brands controller. */
export interface BrandDTO {
  id: string;
  shopId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Matches the ResponseCustomerDto from the NestJS customers controller. */
export interface CustomerDTO {
  id: string;
  shopId: string;
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  openingBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: ApiErrorBody
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
