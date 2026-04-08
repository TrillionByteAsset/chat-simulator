import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getCategoryListing } from '@/lib/sanity/blog';
import {
  getBlogBreadcrumbStructuredData,
  getBlogCollectionStructuredData,
} from '@/lib/seo/blog-structured-data';
import { type SanityLocale } from '@/lib/sanity/queries';
import { Blog } from '@/themes/default/blocks/blog';
import { type DynamicPage } from '@/shared/types/blocks/landing';
import { getBlogIndexMetadata } from '../../shared';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.blog' });
  const page: DynamicPage = t.raw('page');
  const result = await getCategoryListing(locale as SanityLocale, slug);

  if (!result) {
    return {
      robots: {
        follow: false,
        index: false,
      },
      title: 'Blog Category Not Found',
    };
  }

  return getBlogIndexMetadata({
    category: result.currentCategory,
    description:
      result.currentCategory.description ||
      page.sections?.blog?.description ||
      t('metadata.description'),
    languagePaths: {
      en: result.currentCategory.slug_en
        ? `/blog/category/${result.currentCategory.slug_en}`
        : undefined,
      zh: result.currentCategory.slug_zh
        ? `/blog/category/${result.currentCategory.slug_zh}`
        : undefined,
    },
    locale,
    title: result.currentCategory.title || page.title || t('metadata.title'),
  });
}

export default async function CategoryBlogPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.blog');
  const page: DynamicPage = t.raw('page');
  const result = await getCategoryListing(locale as SanityLocale, slug);

  if (!result) {
    notFound();
  }

  const allCategory = {
    slug: 'all',
    title: t('messages.all'),
    url: '/blog',
  };
  const collectionStructuredData = getBlogCollectionStructuredData({
    category: result.currentCategory,
    locale,
    posts: result.posts,
  });
  const breadcrumbStructuredData = getBlogBreadcrumbStructuredData({
    currentPath: `/blog/category/${result.currentCategory.slug}`,
    currentTitle: result.currentCategory.title || page.sections?.blog?.title || '',
    locale,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      <Blog
        section={{
          ...(page.sections?.blog || {}),
          description:
            result.currentCategory.description ||
            page.sections?.blog?.description,
          title: result.currentCategory.title || page.sections?.blog?.title,
        }}
        categories={[allCategory, ...result.categories]}
        currentCategory={result.currentCategory}
        posts={result.posts}
      />
    </>
  );
}
