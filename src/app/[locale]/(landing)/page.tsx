import { Metadata } from 'next';
import { getLocalizedToolManifest } from '@/tools/shared/localized-tool-manifest';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getToolManifest } from '@/core/tooling-engine/DynamicLoader';
import { generateToolMetadata } from '@/core/tooling-engine/metadata';
import { envConfigs } from '@/config';
import { DynamicPage } from '@/shared/types/blocks/landing';

export const revalidate = 3600;

/**
 * 当使用 tools 主题时，从默认工具的 manifest 注入 SEO 元数据
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (envConfigs.theme === 'tools' && envConfigs.default_tool) {
    const manifest = getLocalizedToolManifest(
      await getToolManifest(envConfigs.default_tool),
      locale
    );
    if (manifest) {
      return generateToolMetadata(manifest, {
        canonicalPath: '/',
        locale,
      });
    }
  }
  return {};
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.index');

  // get page data
  const page: DynamicPage = t.raw('page');

  const Page =
    envConfigs.theme === 'tools'
      ? (await import('@/themes/tools/pages/dynamic-page')).default
      : (await import('@/themes/default/pages/dynamic-page')).default;

  return <Page locale={locale} page={page} />;
}
