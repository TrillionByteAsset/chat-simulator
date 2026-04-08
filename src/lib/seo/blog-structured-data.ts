import type { Post } from '@/shared/types/blocks/blog';
import type { Category } from '@/shared/types/blocks/blog';

import {
  buildAbsoluteUrl,
  buildLocalizedUrl,
  getLanguageAlternates,
} from '@/shared/lib/seo';
import { envConfigs } from '@/config';

function breadcrumbItem(position: number, name: string, item: string) {
  return {
    '@type': 'ListItem',
    item,
    name,
    position,
  };
}

export function getBlogBreadcrumbStructuredData({
  currentTitle,
  currentPath,
  locale,
}: {
  currentPath: string;
  currentTitle: string;
  locale: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      breadcrumbItem(
        1,
        locale === 'zh' ? '首页' : 'Home',
        buildLocalizedUrl('/', locale)
      ),
      breadcrumbItem(
        2,
        locale === 'zh' ? '博客' : 'Blog',
        buildLocalizedUrl('/blog', locale)
      ),
      breadcrumbItem(3, currentTitle, buildLocalizedUrl(currentPath, locale)),
    ],
  };
}

export function getBlogCollectionStructuredData({
  category,
  locale,
  posts,
}: {
  category?: Category;
  locale: string;
  posts: Post[];
}) {
  const currentPath = category?.slug
    ? `/blog/category/${category.slug}`
    : '/blog';
  const title =
    category?.title || (locale === 'zh' ? '博客文章' : 'Blog Articles');

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    url: buildLocalizedUrl(currentPath, locale),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: buildLocalizedUrl(`/blog/${post.slug}`, locale),
        name: post.title,
      })),
    },
  };
}

export function getBlogPostStructuredData({
  locale,
  post,
}: {
  locale: string;
  post: Post;
}) {
  const slugByLocale = {
    en: post.slug_en ? `/blog/${post.slug_en}` : undefined,
    zh: post.slug_zh ? `/blog/${post.slug_zh}` : undefined,
  };
  const currentPath = slugByLocale[locale as 'en' | 'zh'] || `/blog/${post.slug}`;
  const languageAlternates = getLanguageAlternates(slugByLocale);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seo_title || post.title,
    description: post.seo_description || post.description,
    image: post.image
      ? [buildAbsoluteUrl(post.image)]
      : [buildAbsoluteUrl(envConfigs.app_preview_image)],
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    inLanguage: locale === 'zh' ? 'zh-CN' : 'en',
    author: post.author_name
      ? {
          '@type': 'Person',
          image: post.author_image ? buildAbsoluteUrl(post.author_image) : undefined,
          name: post.author_name,
          description: post.author_bio,
        }
      : undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': buildLocalizedUrl(currentPath, locale),
    },
    url: buildLocalizedUrl(currentPath, locale),
    isPartOf: {
      '@type': 'Blog',
      name: locale === 'zh' ? '博客' : 'Blog',
      url: buildLocalizedUrl('/blog', locale),
    },
    publisher: {
      '@type': 'Organization',
      logo: {
        '@type': 'ImageObject',
        url: buildAbsoluteUrl(envConfigs.app_logo),
      },
      name: envConfigs.app_name,
    },
    ...(Object.keys(languageAlternates).length
      ? {
          workTranslation: Object.entries(languageAlternates)
            .filter(([key]) => key !== 'x-default')
            .map(([language, url]) => ({
              '@type': 'WebPage',
              inLanguage: language,
              url,
            })),
        }
      : {}),
  };
}
