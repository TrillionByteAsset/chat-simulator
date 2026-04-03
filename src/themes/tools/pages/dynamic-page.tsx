import { getLocalizedToolManifest } from '@/tools/shared/localized-tool-manifest';

import DynamicLoader, {
  getToolManifest,
} from '@/core/tooling-engine/DynamicLoader';
import { envConfigs } from '@/config';
import type { DynamicPage as DynamicPageType } from '@/shared/types/blocks/landing';
import ChatSimulatorTool from '@/tools/chat-simulator/index';
import { OtherTools } from '@/themes/tools/blocks/other-tools';
import { ToolCaseShowcase } from '@/themes/tools/blocks/tool-case-showcase';
import { ToolIntro } from '@/themes/tools/blocks/tool-intro';
import { ToolStage } from '@/themes/tools/blocks/tool-stage';

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
  const activeSkin = manifest?.config?.skin_preset || 'default';
  const toolScopeClassName = `tool-root-${defaultTool} ds-tool-wrapper`;
  const toolSkinClassName = `skin-theme-${activeSkin}`;

  const pageHeading = manifest?.seo?.h1 || manifest?.name || page.title || '';
  const pageDescription = manifest?.seo?.description || page.description || '';

  return (
    <>
      <ToolStage heading={pageHeading} description={pageDescription}>
        {defaultTool === 'chat-simulator' && manifest ? (
          <div
            className={`${toolScopeClassName} ${toolSkinClassName} flex h-full w-full flex-col`}
          >
            <ChatSimulatorTool
              manifest={manifest}
              structuredDataPath="/"
              themeName="tools"
            />
          </div>
        ) : (
          <DynamicLoader toolName={defaultTool} themeName="tools" />
        )}
      </ToolStage>

      <ToolCaseShowcase toolName={defaultTool} />

      <ToolIntro toolName={defaultTool} />

      <OtherTools />
    </>
  );
}
