import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import type { CreateProductInput, UpdateProductInput } from '@/lib/api/types';
import type { ProductImageReorderItem } from '@/types';

import {
  createProduct,
  deleteProductImage,
  reorderProductImages,
  updateProduct,
  uploadProductImage
} from './service';
import { productsQueryKeys } from './queries';

export function useCreateProduct() {
  const t = useTranslations('dukaan.product');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.lists() });
      toast.success(t('productCreated'));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
}

export function useUpdateProduct(id: string) {
  const t = useTranslations('dukaan.product');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProductInput) => updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.detail(id) });
      toast.success(t('productUpdated'));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
}

export function useUploadProductImage(productId: string) {
  const t = useTranslations('dukaan.product');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadProductImage(productId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.imageList(productId) });
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.lists() });
      toast.success(t('imageAdded'));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
}

export function useReorderProductImages(productId: string) {
  const t = useTranslations('dukaan.product');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: ProductImageReorderItem[]) => reorderProductImages(productId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.imageList(productId) });
      toast.success(t('imageReordered'));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
}

export function useDeleteProductImage(productId: string) {
  const t = useTranslations('dukaan.product');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => deleteProductImage(productId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.imageList(productId) });
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.lists() });
      toast.success(t('imageRemoved'));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
}
