import type { MetadataRoute } from 'next';
import { getDefaultToolName } from '@/tools/shared/default-tool-manifest';
import { buildLocalizedUrl } from '@/tools/shared/tool-site-page-metadata';

import { envConfigs } from '@/config';
import { defaultLocale, locales } from '@/config/locale';

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

export default function sitemap(): MetadataRoute.Sitemap {
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

  return locales.flatMap((locale) =>
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
}
