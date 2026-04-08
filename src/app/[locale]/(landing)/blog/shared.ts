import type { Metadata } from 'next';

import type { Category, Post } from '@/shared/types/blocks/blog';
import { getLanguageAlternates, buildAbsoluteUrl, buildLocalizedUrl } from '@/shared/lib/seo';
import { envConfigs } from '@/config';

function getPostPaths(post: Post) {
  return {
    en: post.slug_en ? `/blog/${post.slug_en}` : undefined,
    zh: post.slug_zh ? `/blog/${post.slug_zh}` : undefined,
  };
}

export function getBlogIndexMetadata({
  category,
  description,
  languagePaths,
  locale,
  title,
}: {
  category?: Category;
  description: string;
  languagePaths?: Partial<Record<string, string>>;
  locale: string;
  title: string;
}): Metadata {
  const canonicalPath = category?.slug
    ? `/blog/category/${category.slug}`
    : '/blog';

  return {
    title,
    description,
    alternates: {
      canonical: buildLocalizedUrl(canonicalPath, locale),
      ...(languagePaths
        ? {
            languages: getLanguageAlternates(languagePaths),
          }
        : {}),
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: buildLocalizedUrl(canonicalPath, locale),
      images: [buildAbsoluteUrl(envConfigs.app_preview_image)],
    },
    robots: {
      follow: true,
      index: true,
    },
    twitter: {
      card: 'summary_large_image',
      description,
      images: [buildAbsoluteUrl(envConfigs.app_preview_image)],
      title,
    },
  };
}

export function getBlogPostMetadata({
  locale,
  post,
}: {
  locale: string;
  post: Post;
}): Metadata {
  const paths = getPostPaths(post);
  const currentPath = paths[locale as 'en' | 'zh'] || `/blog/${post.slug}`;
  const title = post.seo_title || post.title || envConfigs.app_name;
  const description =
    post.seo_description || post.description || envConfigs.app_description;

  return {
    title,
    description,
    alternates: {
      canonical: buildLocalizedUrl(currentPath, locale),
      languages: getLanguageAlternates(paths),
    },
    openGraph: {
      type: 'article',
      title,
      description,
      url: buildLocalizedUrl(currentPath, locale),
      images: [buildAbsoluteUrl(post.image || envConfigs.app_preview_image)],
      publishedTime: post.created_at,
      modifiedTime: post.updated_at || post.created_at,
    },
    robots: {
      follow: !post.noindex,
      index: !post.noindex,
    },
    twitter: {
      card: 'summary_large_image',
      description,
      images: [buildAbsoluteUrl(post.image || envConfigs.app_preview_image)],
      title,
    },
  };
}
