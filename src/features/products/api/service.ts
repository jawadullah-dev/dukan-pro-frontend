import { fakeProducts } from '@/constants/mock-api';
import type {
  ProductFilters,
  ProductsResponse,
  ProductByIdResponse,
  ProductMutationPayload
} from './types';

export async function getProducts(filters: ProductFilters): Promise<ProductsResponse> {
  return fakeProducts.getProducts(filters);
}

export async function getProductById(id: number): Promise<ProductByIdResponse> {
  return fakeProducts.getProductById(id) as Promise<ProductByIdResponse>;
}

export async function createProduct(data: ProductMutationPayload) {
  return fakeProducts.createProduct(data);
}

export async function updateProduct(id: number, data: ProductMutationPayload) {
  return fakeProducts.updateProduct(id, data);
}

export async function deleteProduct(id: number) {
  return fakeProducts.deleteProduct(id);
}
