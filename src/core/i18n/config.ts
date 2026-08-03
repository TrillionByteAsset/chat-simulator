import { defineRouting } from 'next-intl/routing';

import {
  defaultLocale,
  localeDetection,
  localePrefix,
  locales,
} from '@/config/locale';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix,
  localeDetection,
  // Page metadata and sitemap define route-aware hreflang URLs. Disabling
  // middleware-wide Link headers avoids duplicate or incorrect alternates on
  // redirects, private routes, and pages with locale-specific blog slugs.
  alternateLinks: false,
});
