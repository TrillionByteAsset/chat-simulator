import { getLocalizedToolManifest } from '@/tools/shared/localized-tool-manifest';

import { getThemeBlock } from '@/core/theme';
import DynamicLoader, {
  getToolManifest,
} from '@/core/tooling-engine/DynamicLoader';
import { envConfigs } from '@/config';
import type { DynamicPage as DynamicPageType } from '@/shared/types/blocks/landing';

/**
 * Tools Theme Dynamic Page
 *
 * 直接渲染 NEXT_PUBLIC_DEFAULT_TOOL 配置的默认工具。
 * 不展示 Hero/Grid 列表页 —— 首页就是工具本身。
 */
export default async function DynamicPage({
  locale,
  page,
  data,
}: {
  locale?: string;
  page: DynamicPageType;
  data?: Record<string, any>;
}) {
  const defaultTool = envConfigs.default_tool || 'chat-simulator';
  const manifest = getLocalizedToolManifest(
    await getToolManifest(defaultTool),
    locale
  );

  const ToolStage = await getThemeBlock('tool-stage');
  const ToolCaseShowcase = await getThemeBlock('tool-case-showcase');
  const ToolIntro = await getThemeBlock('tool-intro');
  const OtherTools = await getThemeBlock('other-tools');
  const pageHeading = manifest?.seo?.h1 || manifest?.name || page.title || '';
  const pageDescription = manifest?.seo?.description || page.description || '';

  return (
    <>
      <ToolStage heading={pageHeading} description={pageDescription}>
        <DynamicLoader toolName={defaultTool} themeName="tools" />
      </ToolStage>

      <ToolCaseShowcase toolName={defaultTool} />

      <ToolIntro toolName={defaultTool} />

      <OtherTools />
    </>
  );
}
