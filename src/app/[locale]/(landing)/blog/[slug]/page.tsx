import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { getPostBySlug } from '@/lib/sanity/blog';
import {
  getBlogBreadcrumbStructuredData,
  getBlogPostStructuredData,
} from '@/lib/seo/blog-structured-data';
import { type SanityLocale } from '@/lib/sanity/queries';
import { BlogDetail } from '@/themes/default/blocks/blog-detail';
import { getBlogPostMetadata } from '../shared';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(locale as SanityLocale, slug);

  if (!post) {
    return {
      robots: {
        follow: false,
        index: false,
      },
      title: 'Blog Post Not Found',
    };
  }

  return getBlogPostMetadata({ locale, post });
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await getPostBySlug(locale as SanityLocale, slug);

  if (!post) {
    notFound();
  }

  const articleStructuredData = getBlogPostStructuredData({
    locale,
    post,
  });
  const currentPath =
    locale === 'zh'
      ? `/blog/${post.slug_zh || post.slug}`
      : `/blog/${post.slug_en || post.slug}`;
  const breadcrumbStructuredData = getBlogBreadcrumbStructuredData({
    currentPath,
    currentTitle: post.title || '',
    locale,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      <BlogDetail post={post} />
    </>
  );
}
