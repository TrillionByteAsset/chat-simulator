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
  const aiCrawlerDisallow = ['/'];

  return {
    rules: [
      {
        userAgent: 'GPTBot',
        disallow: aiCrawlerDisallow,
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: aiCrawlerDisallow,
      },
      {
        userAgent: 'ClaudeBot',
        disallow: aiCrawlerDisallow,
      },
      {
        userAgent: 'Claude-Web',
        disallow: aiCrawlerDisallow,
      },
      {
        userAgent: 'anthropic-ai',
        disallow: aiCrawlerDisallow,
      },
      {
        userAgent: 'PerplexityBot',
        disallow: aiCrawlerDisallow,
      },
      {
        userAgent: 'Perplexity-User',
        disallow: aiCrawlerDisallow,
      },
      {
        userAgent: 'CCBot',
        disallow: aiCrawlerDisallow,
      },
      {
        userAgent: 'Google-Extended',
        disallow: aiCrawlerDisallow,
      },
      {
        userAgent: 'Bytespider',
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
