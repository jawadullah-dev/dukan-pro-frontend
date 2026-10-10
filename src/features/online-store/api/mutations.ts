import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { onlineStoreKeys } from './queries';
import {
  deleteProductImage,
  reorderProductImages,
  updateStoreSettings,
  uploadProductImage
} from './service';

export const updateStoreSettingsMutation = mutationOptions({
  mutationFn: (data: any) => updateStoreSettings(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: onlineStoreKeys.settings() });
  }
});

export const uploadProductImageMutation = mutationOptions({
  mutationFn: ({ productId, formData }: { productId: string; formData: FormData }) =>
    uploadProductImage(productId, formData),
  onSuccess: (_data, variables) => {
    getQueryClient().invalidateQueries({
      queryKey: onlineStoreKeys.images(variables.productId)
    });
  }
});

export const deleteProductImageMutation = mutationOptions({
  mutationFn: ({ productId, imageId }: { productId: string; imageId: string }) =>
    deleteProductImage(productId, imageId),
  onSuccess: (_data, variables) => {
    getQueryClient().invalidateQueries({
      queryKey: onlineStoreKeys.images(variables.productId)
    });
  }
});

export const reorderProductImagesMutation = mutationOptions({
  mutationFn: ({ productId, imageIds }: { productId: string; imageIds: string[] }) =>
    reorderProductImages(productId, imageIds),
  onSuccess: (_data, variables) => {
    getQueryClient().invalidateQueries({
      queryKey: onlineStoreKeys.images(variables.productId)
    });
  }
});
