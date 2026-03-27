import { ReactNode } from 'react';

import { envConfigs } from '@/config';
import { getThemeBlock } from '@/core/theme';
import { getToolManifest } from '@/core/tooling-engine/DynamicLoader';
import {
  Footer as FooterType,
  Header as HeaderType,
} from '@/shared/types/blocks/landing';

/**
 * Tools Theme Landing Layout
 * 使用工具主题自己的 tool-header 和 tool-footer
 * 从默认工具的 manifest 读取导航和底部配置
 */
export default async function LandingLayout({
  children,
  header,
  footer,
}: {
  children: ReactNode;
  header: HeaderType;
  footer: FooterType;
}) {
  // 获取默认工具的 manifest 以驱动 header/footer
  const defaultTool = envConfigs.default_tool || 'chat-simulator';
  const manifest = await getToolManifest(defaultTool);

  // 加载工具主题自己的 header/footer 块
  const ToolHeader = await getThemeBlock('tool-header');
  const ToolFooter = await getThemeBlock('tool-footer');

  return (
    <div className="min-h-screen w-screen flex flex-col">
      {/* 工具主题导航栏：没有配置 nav 时不渲染 */}
      {manifest && <ToolHeader manifest={manifest} />}

      {/* 主内容区 */}
      <main className="flex-1">
        {children}
      </main>

      {/* 工具主题底部栏：始终显示 SEO 信息，可选显示自定义内容 */}
      {manifest && <ToolFooter manifest={manifest} />}
    </div>
  );
}
