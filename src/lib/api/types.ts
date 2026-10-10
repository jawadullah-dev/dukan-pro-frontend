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
