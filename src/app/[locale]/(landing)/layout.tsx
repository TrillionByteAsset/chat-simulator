import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { envConfigs } from '@/config';
import { LocaleDetector } from '@/shared/blocks/common/locale-detector';
import { TopBanner } from '@/shared/blocks/common/top-banner';
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
  // header and footer to display
  const header: HeaderType = t.raw('header');
  const footer: FooterType = t.raw('footer');

  const isToolsTheme = envConfigs.theme === 'tools';
  const Layout = isToolsTheme
    ? (await import('@/themes/tools/layouts/landing')).default
    : (await import('@/themes/default/layouts/landing')).default;

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
