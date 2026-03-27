import { ReactNode } from 'react';

import { envConfigs } from '@/config';
import { getThemeBlock } from '@/core/theme';
import { getToolManifest } from '@/core/tooling-engine/DynamicLoader';
import {
  Footer as FooterType,
  Header as HeaderType,
} from '@/shared/types/blocks/landing';

/**
 * Tools Theme - Tool Layout
 * 单个工具页面的布局（使用工具主题自己的 header/footer）
 */
export default async function ToolLayout({
  children,
  header,
  footer,
}: {
  children: ReactNode;
  header: HeaderType;
  footer: FooterType;
}) {
  const defaultTool = envConfigs.default_tool || 'chat-simulator';
  const manifest = await getToolManifest(defaultTool);

  const ToolHeader = await getThemeBlock('tool-header');
  const ToolFooter = await getThemeBlock('tool-footer');

  return (
    <div className="min-h-screen w-screen flex flex-col">
      {manifest && <ToolHeader manifest={manifest} />}
      <main className="flex-1">
        {children}
      </main>
      {manifest && <ToolFooter manifest={manifest} />}
    </div>
  );
}
