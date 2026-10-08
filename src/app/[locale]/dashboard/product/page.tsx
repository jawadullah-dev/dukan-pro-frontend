import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import ProductListingPage from '@/features/products/components/product-listing';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { SearchParams } from 'nuqs/server';
import { productInfoContent } from '@/config/infoconfig';
import { getLocale, getTranslations } from 'next-intl/server';
import { localize } from '@/lib/auth/routes';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('products')
  };
}

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);
  const locale = await getLocale();
  const t = await getTranslations();

  return (
    <PageContainer
      fill
      pageTitle='pages.product.title'
      pageDescription='pages.product.description'
      infoContent={productInfoContent}
      pageHeaderAction={
        <Link
          href={localize('/dashboard/product/new', locale)}
          className={cn(buttonVariants(), 'text-xs md:text-sm')}
        >
          <Icons.add className='me-2 h-4 w-4' />
          {t('common.add')}
        </Link>
      }
    >
      <ProductListingPage />
    </PageContainer>
  );
}
