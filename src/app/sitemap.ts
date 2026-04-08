import type { MetadataRoute } from 'next';
import { getDefaultToolName } from '@/tools/shared/default-tool-manifest';

import { envConfigs } from '@/config';
import { defaultLocale, locales } from '@/config/locale';
import { getBlogSitemapEntries } from '@/lib/sanity/blog';
import {
  buildLocalizedUrl,
  getLanguageAlternates,
} from '@/shared/lib/seo';

function withLocale(path: string, locale: string) {
  if (locale === defaultLocale) {
    return path;
  }

  return `/${locale}${path}`;
}

function getPathPriority(path: string, defaultTool: string) {
  if (path === '/' || path === `/tools/${defaultTool}`) {
    return 1;
  }

  if (path === '/faq' || path === `/tools/${defaultTool}/faq`) {
    return 0.85;
  }

  if (
    path === '/about' ||
    path === '/privacy' ||
    path === '/terms' ||
    path === `/tools/${defaultTool}/about` ||
    path === `/tools/${defaultTool}/privacy` ||
    path === `/tools/${defaultTool}/terms`
  ) {
    return 0.7;
  }

  return 0.6;
}

function getChangeFrequency(path: string, defaultTool: string) {
  if (path === '/' || path === `/tools/${defaultTool}`) {
    return 'weekly' as const;
  }

  if (path === '/faq' || path === `/tools/${defaultTool}/faq`) {
    return 'monthly' as const;
  }

  return 'yearly' as const;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const defaultTool = getDefaultToolName();
  const now = new Date();
  const pagePaths = [
    '/',
    '/about',
    '/faq',
    '/privacy',
    '/terms',
    `/tools/${defaultTool}`,
    `/tools/${defaultTool}/about`,
    `/tools/${defaultTool}/faq`,
    `/tools/${defaultTool}/privacy`,
    `/tools/${defaultTool}/terms`,
  ];

  const staticEntries = locales.flatMap((locale) =>
    pagePaths.map((path) => ({
      url:
        path === '/'
          ? `${envConfigs.app_url}${locale === defaultLocale ? '' : `/${locale}`}`
          : buildLocalizedUrl(withLocale(path, locale)),
      lastModified: now,
      changeFrequency: getChangeFrequency(path, defaultTool),
      priority: getPathPriority(path, defaultTool),
    }))
  );

  const { categories, posts } = await getBlogSitemapEntries();

  const blogEntries: MetadataRoute.Sitemap = [
    {
      url: buildLocalizedUrl('/blog', defaultLocale),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
      alternates: {
        languages: getLanguageAlternates({
          en: '/blog',
          zh: '/blog',
        }),
      },
    },
  ];

  categories.forEach((category) => {
    if (category.slugZh || category.slugEn) {
      const languages = getLanguageAlternates({
        en: category.slugEn ? `/blog/category/${category.slugEn}` : undefined,
        zh: category.slugZh ? `/blog/category/${category.slugZh}` : undefined,
      });

      const canonicalLocale = category.slugZh ? 'zh' : 'en';
      const canonicalPath =
        canonicalLocale === 'zh'
          ? `/blog/category/${category.slugZh}`
          : `/blog/category/${category.slugEn}`;

      blogEntries.push({
        alternates: {
          languages,
        },
        changeFrequency: 'weekly',
        lastModified: category._updatedAt
          ? new Date(category._updatedAt)
          : now,
        priority: 0.7,
        url: buildLocalizedUrl(canonicalPath, canonicalLocale),
      });
    }
  });

  posts.forEach((post) => {
    if (post.slugZh || post.slugEn) {
      const languages = getLanguageAlternates({
        en: post.slugEn ? `/blog/${post.slugEn}` : undefined,
        zh: post.slugZh ? `/blog/${post.slugZh}` : undefined,
      });

      const canonicalLocale = post.slugZh ? 'zh' : 'en';
      const canonicalPath =
        canonicalLocale === 'zh'
          ? `/blog/${post.slugZh}`
          : `/blog/${post.slugEn}`;

      blogEntries.push({
        alternates: {
          languages,
        },
        changeFrequency: 'monthly',
        lastModified: new Date(post._updatedAt || post.publishedAt || now),
        priority: 0.75,
        url: buildLocalizedUrl(canonicalPath, canonicalLocale),
      });
    }
  });

  return [...staticEntries, ...blogEntries];
}
