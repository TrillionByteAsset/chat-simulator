import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getBlogListing } from '@/lib/sanity/blog';
import { getBlogCollectionStructuredData, getBlogBreadcrumbStructuredData } from '@/lib/seo/blog-structured-data';
import { type SanityLocale } from '@/lib/sanity/queries';
import { Blog } from '@/themes/default/blocks/blog';
import { type DynamicPage } from '@/shared/types/blocks/landing';
import { getBlogIndexMetadata } from './shared';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.blog' });
  const page: DynamicPage = t.raw('page');

  return getBlogIndexMetadata({
    description:
      page.sections?.blog?.description || t('metadata.description'),
    languagePaths: {
      en: '/blog',
      zh: '/blog',
    },
    locale,
    title: page.title || t('metadata.title'),
  });
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.blog');
  const page: DynamicPage = t.raw('page');
  const { categories, posts } = await getBlogListing(locale as SanityLocale);
  const allCategory = {
    slug: 'all',
    title: t('messages.all'),
    url: '/blog',
  };
  const collectionStructuredData = getBlogCollectionStructuredData({
    locale,
    posts,
  });
  const breadcrumbStructuredData = getBlogBreadcrumbStructuredData({
    currentPath: '/blog',
    currentTitle: page.title || t('metadata.title'),
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
        section={page.sections?.blog || {}}
        categories={[allCategory, ...categories]}
        currentCategory={allCategory}
        posts={posts}
      />
    </>
  );
}
