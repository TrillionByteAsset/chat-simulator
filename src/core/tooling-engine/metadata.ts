// src/core/tooling-engine/metadata.ts
import { Metadata } from 'next';

import { envConfigs } from '@/config';
import { defaultLocale } from '@/config/locale';

import { ToolManifest } from './types';

interface GenerateToolMetadataOptions {
  canonicalPath?: string;
  locale?: string;
  overrideDescription?: string;
  overrideTitle?: string;
}

function buildCanonicalUrl(path?: string, locale?: string) {
  if (!path) {
    return undefined;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const localizedPath =
    locale && locale !== defaultLocale
      ? `/${locale}${normalizedPath}`
      : normalizedPath;

  return `${envConfigs.app_url}${localizedPath}`;
}

/**
 * MetadataRouter: 动态读取工具配置并注入 Next.js Metadata
 * 供 app/[...slug]/page.tsx 的 generateMetadata 调用
 */
export function generateToolMetadata(
  manifest: ToolManifest | null,
  overrideTitleOrOptions?: string | GenerateToolMetadataOptions
): Metadata {
  if (!manifest) {
    return {};
  }

  const { seo, geo } = manifest;
  const options: GenerateToolMetadataOptions =
    typeof overrideTitleOrOptions === 'string'
      ? { overrideTitle: overrideTitleOrOptions }
      : (overrideTitleOrOptions ?? {});
  const title = options.overrideTitle || seo.title;
  const description = options.overrideDescription || seo.description;
  const canonical = buildCanonicalUrl(options.canonicalPath, options.locale);

  const metadata: Metadata = {
    title,
    description,
    keywords: seo.keywords?.join(', '),
    ...(canonical
      ? {
          alternates: {
            canonical,
          },
        }
      : {}),
    openGraph: {
      title,
      description,
      ...(canonical ? { url: canonical } : {}),
      ...(seo.openGraph?.images ? { images: seo.openGraph.images } : {}),
    },
  };

  // 注入 GEO 信息
  if (geo) {
    const geoMeta: Record<string, string> = {};
    if (geo.region) geoMeta['geo.region'] = geo.region;
    if (geo.placename) geoMeta['geo.placename'] = geo.placename;
    if (geo.latitude && geo.longitude) {
      geoMeta['geo.position'] = `${geo.latitude};${geo.longitude}`;
      geoMeta['ICBM'] = `${geo.latitude}, ${geo.longitude}`;
    }
    if (Object.keys(geoMeta).length > 0) {
      metadata.other = geoMeta;
    }
  }

  return metadata;
}
