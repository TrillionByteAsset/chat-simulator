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
    kind: 'about',
    locale,
    manifest,
    canonicalPath: '/about',
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const manifest = await getDefaultToolManifest();

  if (!manifest) {
    notFound();
  }

  return <ToolSitePage kind="about" locale={locale} manifest={manifest} />;
}
