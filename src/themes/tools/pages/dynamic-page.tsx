import { envConfigs } from '@/config';
import { getThemeBlock } from '@/core/theme';
import DynamicLoader from '@/core/tooling-engine/DynamicLoader';
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

  const ToolStage = await getThemeBlock('tool-stage');
  const ToolIntro = await getThemeBlock('tool-intro');
  const OtherTools = await getThemeBlock('other-tools');

  return (
    <>
      <ToolStage>
        <DynamicLoader toolName={defaultTool} themeName="tools" />
      </ToolStage>

      <ToolIntro toolName={defaultTool} />

      <OtherTools />
    </>
  );
}
