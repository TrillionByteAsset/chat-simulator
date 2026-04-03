import { ReactNode } from 'react';
import { getLocalizedToolManifest } from '@/tools/shared/localized-tool-manifest';
import { getLocale } from 'next-intl/server';

import { getToolManifest } from '@/core/tooling-engine/DynamicLoader';
import { envConfigs } from '@/config';
import {
  Footer as FooterType,
  Header as HeaderType,
} from '@/shared/types/blocks/landing';
import { ToolFooter } from '@/themes/tools/blocks/tool-footer';
import { ToolHeader } from '@/themes/tools/blocks/tool-header';

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
  const locale = await getLocale();
  // 获取默认工具的 manifest 以驱动 header/footer
  const defaultTool = envConfigs.default_tool || 'chat-simulator';
  const manifest = getLocalizedToolManifest(
    await getToolManifest(defaultTool),
    locale
  );

  return (
    <div className="flex min-h-screen w-screen flex-col">
      {/* 工具主题导航栏：没有配置 nav 时不渲染 */}
      {manifest && <ToolHeader manifest={manifest} />}

      {/* 主内容区 */}
      <main className="flex-1">{children}</main>

      {/* 工具主题底部栏：始终显示 SEO 信息，可选显示自定义内容 */}
      {manifest && <ToolFooter manifest={manifest} />}
    </div>
  );
}
