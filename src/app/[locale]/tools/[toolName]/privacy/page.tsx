import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ToolSitePage } from '@/tools/shared/tool-site-page';
import { getToolSitePageContent } from '@/tools/shared/tool-site-page-content';

import { getToolManifest } from '@/core/tooling-engine/DynamicLoader';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; toolName: string }>;
}): Promise<Metadata> {
  const { locale, toolName } = await params;
  const manifest = await getToolManifest(toolName);

  if (!manifest) {
    return { title: 'Page Not Found' };
  }

  const page = getToolSitePageContent({ kind: 'privacy', locale, manifest });

  return {
    title: page.seoTitle,
    description: page.seoDescription,
    openGraph: {
      title: page.seoTitle,
      description: page.seoDescription,
      ...(manifest.seo?.openGraph?.images
        ? { images: manifest.seo.openGraph.images }
        : {}),
    },
  };
}

export default async function ToolPrivacyPage({
  params,
}: {
  params: Promise<{ locale: string; toolName: string }>;
}) {
  const { locale, toolName } = await params;
  const manifest = await getToolManifest(toolName);

  if (!manifest) {
    notFound();
  }

  return <ToolSitePage kind="privacy" locale={locale} manifest={manifest} />;
}
