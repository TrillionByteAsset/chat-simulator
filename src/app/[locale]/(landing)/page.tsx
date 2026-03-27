import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { envConfigs } from '@/config';
import { getThemePage } from '@/core/theme';
import { getToolManifest } from '@/core/tooling-engine/DynamicLoader';
import { generateToolMetadata } from '@/core/tooling-engine/metadata';
import { DynamicPage } from '@/shared/types/blocks/landing';

export const revalidate = 3600;

/**
 * 当使用 tools 主题时，从默认工具的 manifest 注入 SEO 元数据
 */
export async function generateMetadata(): Promise<Metadata> {
  if (envConfigs.theme === 'tools' && envConfigs.default_tool) {
    const manifest = await getToolManifest(envConfigs.default_tool);
    if (manifest) {
      return generateToolMetadata(manifest);
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

  // load page component
  const Page = await getThemePage('dynamic-page');

  return <Page locale={locale} page={page} />;
}
