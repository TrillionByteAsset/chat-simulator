import { ReactNode } from 'react';

import { getThemeBlock } from '@/core/theme';
import {
  Footer as FooterType,
  Header as HeaderType,
} from '@/shared/types/blocks/landing';

/**
 * Tool Layout: 工具页面的专属布局
 * 对应 UE 线框：Header(LOGO) → children(工具功能区 + 功能介绍 + 其他工具) → Footer
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
  const Header = await getThemeBlock('header');
  const Footer = await getThemeBlock('footer');

  return (
    <div className="h-screen w-screen">
      {/* UE Section 1: Header / LOGO */}
      <Header header={header} />
      
      {/* Main content area: Tool Stage + Feature Intro + Other Tools */}
      <main className="pt-14 lg:pt-18">
        {children}
      </main>

      {/* Footer */}
      <Footer footer={footer} />
    </div>
  );
}
