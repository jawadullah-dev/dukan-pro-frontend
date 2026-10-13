import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import type { CreateProductInput, UpdateProductInput } from '@/lib/api/types';

import {
  bulkPublish,
  createProduct,
  deleteProduct,
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

export function useDeleteProduct(id: string) {
  const t = useTranslations('dukaan.product');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.lists() });
      toast.success(t('productDeactivated'));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
}

export function useBulkPublish() {
  const t = useTranslations('dukaan.product');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, isPublished }: { ids: string[]; isPublished: boolean }) =>
      bulkPublish(ids, isPublished),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.lists() });
      toast.success(t('publishUpdated'));
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
    mutationFn: (items: { id: string; sortOrder: number }[]) =>
      reorderProductImages(productId, items),
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
