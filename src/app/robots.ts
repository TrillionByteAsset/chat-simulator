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
    '/studio',
    '/studio/*',
  ];
  const aiCrawlerDisallow = defaultDisallow;

  return {
    rules: [
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: aiCrawlerDisallow,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: aiCrawlerDisallow,
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: aiCrawlerDisallow,
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: aiCrawlerDisallow,
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: aiCrawlerDisallow,
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: aiCrawlerDisallow,
      },
      {
        userAgent: 'Perplexity-User',
        allow: '/',
        disallow: aiCrawlerDisallow,
      },
      {
        userAgent: 'CCBot',
        allow: '/',
        disallow: aiCrawlerDisallow,
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: aiCrawlerDisallow,
      },
      {
        userAgent: 'Bytespider',
        allow: '/',
        disallow: aiCrawlerDisallow,
      },
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
