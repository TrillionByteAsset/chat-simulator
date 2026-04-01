import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDefaultToolManifest } from '@/tools/shared/default-tool-manifest';
import { ToolSitePage } from '@/tools/shared/tool-site-page';
import { getToolSitePageMetadata } from '@/tools/shared/tool-site-page-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const manifest = await getDefaultToolManifest();

  if (!manifest) {
    return { title: 'Page Not Found' };
  }

  return getToolSitePageMetadata({
    kind: 'faq',
    locale,
    manifest,
    canonicalPath: '/faq',
  });
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const manifest = await getDefaultToolManifest();

  if (!manifest) {
    notFound();
  }

  return <ToolSitePage kind="faq" locale={locale} manifest={manifest} />;
}
