// src/core/tooling-engine/metadata.ts
import { Metadata } from 'next';
import { ToolManifest } from './types';

/**
 * MetadataRouter: 动态读取工具配置并注入 Next.js Metadata
 * 供 app/[...slug]/page.tsx 的 generateMetadata 调用
 */
export function generateToolMetadata(manifest: ToolManifest | null, overrideTitle?: string): Metadata {
  if (!manifest) {
    return {};
  }

  const { seo, geo } = manifest;

  const metadata: Metadata = {
    title: overrideTitle || seo.title,
    description: seo.description,
    keywords: seo.keywords?.join(', '),
    openGraph: {
      title: overrideTitle || seo.title,
      description: seo.description,
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
