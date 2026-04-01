import { ReactNode } from 'react';
import { getLocalizedToolManifest } from '@/tools/shared/localized-tool-manifest';
import { getLocale } from 'next-intl/server';

import { getThemeBlock } from '@/core/theme';
import { getToolManifest } from '@/core/tooling-engine/DynamicLoader';
import { envConfigs } from '@/config';
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
  const locale = await getLocale();
  const defaultTool = envConfigs.default_tool || 'chat-simulator';
  const manifest = getLocalizedToolManifest(
    await getToolManifest(defaultTool),
    locale
  );

  const ToolHeader = await getThemeBlock('tool-header');
  const ToolFooter = await getThemeBlock('tool-footer');

  return (
    <div className="flex min-h-screen w-screen flex-col">
      {manifest && <ToolHeader manifest={manifest} />}
      <main className="flex-1">{children}</main>
      {manifest && <ToolFooter manifest={manifest} />}
    </div>
  );
}
