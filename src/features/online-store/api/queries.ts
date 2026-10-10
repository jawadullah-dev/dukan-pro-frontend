import { queryOptions } from '@tanstack/react-query';
import {
  getProductImages,
  getPublicStorefront,
  getPublicStoreProducts,
  getStoreSettings
} from './service';

export const onlineStoreKeys = {
  all: ['online-store'] as const,
  settings: () => [...onlineStoreKeys.all, 'settings'] as const,
  images: (productId: string) => [...onlineStoreKeys.all, 'images', productId] as const,
  publicStore: (slug: string) => [...onlineStoreKeys.all, 'publicStore', slug] as const,
  publicProducts: (slug: string, query?: Record<string, any>) =>
    [...onlineStoreKeys.all, 'publicProducts', slug, query] as const
};

export const storeSettingsQueryOptions = () =>
  queryOptions({
    queryKey: onlineStoreKeys.settings(),
    queryFn: () => getStoreSettings()
  });

export const productImagesQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: onlineStoreKeys.images(productId),
    queryFn: () => getProductImages(productId)
  });

export const publicStorefrontQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: onlineStoreKeys.publicStore(slug),
    queryFn: () => getPublicStorefront(slug)
  });

export const publicStoreProductsQueryOptions = (slug: string, query: Record<string, any> = {}) =>
  queryOptions({
    queryKey: onlineStoreKeys.publicProducts(slug, query),
    queryFn: () => getPublicStoreProducts(slug, query)
  });
