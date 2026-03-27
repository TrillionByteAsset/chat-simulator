import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { getThemeLayout } from '@/core/theme';
import { LocaleDetector } from '@/shared/blocks/common';
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

  // Load the tool-specific layout from the theme
  const Layout = await getThemeLayout('tool');

  const header: HeaderType = t.raw('header');
  const footer: FooterType = t.raw('footer');

  return (
    <Layout header={header} footer={footer}>
      <LocaleDetector />
      {children}
    </Layout>
  );
}
