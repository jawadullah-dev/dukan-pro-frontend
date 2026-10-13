'use client';

import { useRef, useState } from 'react';
import {
  IconPhoto as ImageIcon,
  IconLoader2,
  IconPlus,
  IconTrash,
  IconUpload
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ProductImageDTO } from '@/lib/api/types';
import { AppError } from '@/lib/errors';

import {
  useDeleteProductImage,
  useReorderProductImages,
  useUploadProductImage
} from '../api/mutations';

interface ProductPhotoManagerProps {
  productId: string;
  images: ProductImageDTO[];
  onChange: (images: ProductImageDTO[]) => void;
}

export function ProductPhotoManager({ productId, images, onChange }: ProductPhotoManagerProps) {
  const t = useTranslations('dukaan.product');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isIconUploading, setIsIconUploading] = useState(false);

  const uploadMutation = useUploadProductImage(productId);
  const deleteMutation = useDeleteProductImage(productId);
  const reorderMutation = useReorderProductImages(productId);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsIconUploading(true);
      const resizedBlob = await resizeImage(file, 1600);
      const resizedFile = new File([resizedBlob], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      uploadMutation.mutate(resizedFile, {
        onSettled: () => {
          setIsIconUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      });
    } catch (error) {
      setIsIconUploading(false);
      toast.error((error as Error).message || t('imageTypeError'));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = (imageId: string) => {
    if (confirm(t('removeImageConfirm') || 'Remove this image?')) {
      deleteMutation.mutate(imageId);
    }
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    onChange(newImages);
    reorderMutation.mutate(newImages.map((img, idx) => ({ id: img.id, sortOrder: idx })));
  };

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-medium'>{t('images')}</h3>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => fileInputRef.current?.click()}
          disabled={isIconUploading || uploadMutation.isPending}
        >
          {isIconUploading || uploadMutation.isPending ? (
            <IconLoader2 className='me-2 h-4 w-4 animate-spin' />
          ) : (
            <IconPlus className='me-2 h-4 w-4' />
          )}
          {isIconUploading || uploadMutation.isPending ? t('uploading') : t('uploadImage')}
        </Button>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/jpeg,image/png,image/webp'
          className='hidden'
          onChange={handleFileSelect}
        />
      </div>
      {images.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-muted-foreground'>
          <ImageIcon className='mb-2 h-8 w-8' />
          <p className='text-sm'>{t('noImages')}</p>
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
          {images.map((image, index) => (
            <div key={image.id} className='group relative overflow-hidden rounded-lg border'>
              <img
                src={image.url}
                alt={`${t('images')} ${index + 1}`}
                className='h-32 w-full object-cover'
                loading='lazy'
              />
              <div className='absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
                <Button
                  type='button'
                  variant='secondary'
                  size='icon'
                  className='h-8 w-8'
                  onClick={() => handleMove(index, index - 1)}
                  disabled={index === 0 || reorderMutation.isPending}
                >
                  <IconUpload className='h-4 w-4 rotate-90' />
                </Button>
                <Button
                  type='button'
                  variant='destructive'
                  size='icon'
                  className='h-8 w-8'
                  onClick={() => handleDelete(image.id)}
                  disabled={deleteMutation.isPending}
                >
                  <IconTrash className='h-4 w-4' />
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='icon'
                  className='h-8 w-8'
                  onClick={() => handleMove(index, index + 1)}
                  disabled={index === images.length - 1 || reorderMutation.isPending}
                >
                  <IconUpload className='h-4 w-4 -rotate-90' />
                </Button>
              </div>
              {index === 0 && (
                <div className='absolute start-1 top-1 rounded bg-primary px-1.5 py-0.5 text-xs text-primary-foreground'>
                  {t('cover')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

async function resizeImage(file: File, maxSize: number): Promise<Blob> {
  const img = await loadImage(file);
  const { width, height } = getScaledDimensions(img.width, img.height, maxSize);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new AppError('Canvas context not available');
  ctx.drawImage(img, 0, 0, width, height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new AppError('Failed to resize image'));
      },
      'image/jpeg',
      0.85
    );
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getScaledDimensions(w: number, h: number, max: number) {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = Math.min(max / w, max / h);
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}
