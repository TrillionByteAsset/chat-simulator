import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ToolSitePage } from '@/tools/shared/tool-site-page';
import { getToolSitePageMetadata } from '@/tools/shared/tool-site-page-metadata';

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

  return getToolSitePageMetadata({
    kind: 'faq',
    locale,
    manifest,
    canonicalPath: `/tools/${toolName}/faq`,
  });
}

export default async function ToolFaqPage({
  params,
}: {
  params: Promise<{ locale: string; toolName: string }>;
}) {
  const { locale, toolName } = await params;
  const manifest = await getToolManifest(toolName);

  if (!manifest) {
    notFound();
  }

  return <ToolSitePage kind="faq" locale={locale} manifest={manifest} />;
}
