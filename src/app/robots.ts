import { MetadataRoute } from 'next';

import { envConfigs } from '@/config';

export default function robots(): MetadataRoute.Robots {
  const appUrl = envConfigs.app_url;
  const defaultDisallow = [
    '/*?*q=',
    '/settings/*',
    '/activity/*',
    '/admin/*',
    '/api/*',
  ];

  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: defaultDisallow,
      },
      {
        userAgent: 'AdsBot-Google',
        allow: '/',
        disallow: defaultDisallow,
      },
      {
        userAgent: 'Mediapartners-Google',
        allow: '/',
        disallow: defaultDisallow,
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: defaultDisallow,
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
