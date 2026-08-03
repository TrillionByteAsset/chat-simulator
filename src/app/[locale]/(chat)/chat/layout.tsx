import type { ReactNode } from 'react';
import type { Metadata } from 'next';

import { AdsensePageScript } from '@/shared/blocks/common/adsense-page-script';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrivateChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <AdsensePageScript />
      {children}
    </>
  );
}
