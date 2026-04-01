import type { Metadata } from 'next';

import type { ToolManifest } from '@/core/tooling-engine/types';
import { envConfigs } from '@/config';
import { defaultLocale } from '@/config/locale';

import {
  getToolSitePageContent,
  type ToolSitePageKind,
} from './tool-site-page-content';

export function buildLocalizedPath(path: string, locale?: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!locale || locale === defaultLocale) {
    return normalizedPath;
  }

  return `/${locale}${normalizedPath}`;
}

export function buildLocalizedUrl(path: string, locale?: string) {
  return `${envConfigs.app_url}${buildLocalizedPath(path, locale)}`;
}

export function getToolSitePageMetadata({
  kind,
  locale,
  manifest,
  canonicalPath,
}: {
  kind: ToolSitePageKind;
  locale?: string;
  manifest: ToolManifest;
  canonicalPath: string;
}): Metadata {
  const page = getToolSitePageContent({ kind, locale, manifest });
  const canonical = buildLocalizedUrl(canonicalPath, locale);

  return {
    title: page.seoTitle,
    description: page.seoDescription,
    alternates: {
      canonical,
    },
    openGraph: {
      title: page.seoTitle,
      description: page.seoDescription,
      url: canonical,
      ...(manifest.seo?.openGraph?.images
        ? { images: manifest.seo.openGraph.images }
        : {}),
    },
  };
}
