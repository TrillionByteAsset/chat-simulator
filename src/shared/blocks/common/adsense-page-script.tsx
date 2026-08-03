import Script from 'next/script';

import { getAllConfigs } from '@/shared/models/config';

export async function AdsensePageScript() {
  const shouldLoad =
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_DEBUG === 'true';

  if (!shouldLoad) {
    return null;
  }

  const adsenseCode = (await getAllConfigs()).adsense_code;

  if (!adsenseCode) {
    return null;
  }

  return (
    <Script
      id="adsense-page-script"
      async
      crossOrigin="anonymous"
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseCode)}`}
    />
  );
}
