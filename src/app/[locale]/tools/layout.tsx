import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { envConfigs } from '@/config';
import { LocaleDetector } from '@/shared/blocks/common/locale-detector';
import {
  Footer as FooterType,
  Header as HeaderType,
} from '@/shared/types/blocks/landing';

/**
 * Tools Layout: 工具页面的路由段布局
 * 使用框架的 getThemeLayout('tool') 加载工具专属布局
 */
export default async function ToolsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getTranslations('landing');
  const header: HeaderType = t.raw('header');
  const footer: FooterType = t.raw('footer');
  const Layout =
    envConfigs.theme === 'tools'
      ? (await import('@/themes/tools/layouts/tool')).default
      : (await import('@/themes/default/layouts/tool')).default;

  return (
    <Layout header={header} footer={footer}>
      <LocaleDetector />
      {children}
    </Layout>
  );
}
