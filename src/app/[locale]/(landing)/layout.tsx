import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { envConfigs } from '@/config';
import { getThemeLayout } from '@/core/theme';
import { LocaleDetector, TopBanner } from '@/shared/blocks/common';
import {
  Footer as FooterType,
  Header as HeaderType,
} from '@/shared/types/blocks/landing';

export default async function LandingLayout({
  children,
}: {
  children: ReactNode;
}) {
  // load page data
  const t = await getTranslations('landing');

  // load layout component
  const Layout = await getThemeLayout('landing');

  // header and footer to display
  const header: HeaderType = t.raw('header');
  const footer: FooterType = t.raw('footer');

  const isToolsTheme = envConfigs.theme === 'tools';

  return (
    <Layout header={header} footer={footer}>
      <LocaleDetector />
      {/* tools 主题不显示 TopBanner */}
      {!isToolsTheme && header.topbanner && header.topbanner.text && (
        <TopBanner
          id="topbanner"
          text={header.topbanner?.text}
          buttonText={header.topbanner?.buttonText}
          href={header.topbanner?.href}
          target={header.topbanner?.target}
          closable
          rememberDismiss
          dismissedExpiryDays={header.topbanner?.dismissedExpiryDays ?? 1}
        />
      )}
      {children}
    </Layout>
  );
}

