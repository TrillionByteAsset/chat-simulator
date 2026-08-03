import bundleAnalyzer from '@next/bundle-analyzer';
import createNextIntlPlugin from 'next-intl/plugin';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withNextIntl = createNextIntlPlugin({
  requestConfig: './src/core/i18n/request.ts',
});

const legacyBlogRedirects = [
  {
    source: '/zh/blog/shejiaomeiti-moniqi',
    destination: '/zh/blog/social-media-chat-simulator-guide',
    statusCode: 301,
  },
  {
    source: '/blog/why-social-media-marketers-are-using-chat-simulator',
    destination: '/blog/how-social-media-marketers-use-chat-simulators',
    statusCode: 301,
  },
  {
    source: '/zh/blog/whatsapp-chat',
    destination: '/zh/blog/whatsapp-style-marketing-mockup-guide',
    statusCode: 301,
  },
  {
    source: '/blog/how-to-create-high-converting-whatsapp-marketing-screenshots',
    destination: '/blog/responsible-whatsapp-style-marketing-mockups',
    statusCode: 301,
  },
  {
    source: '/zh/blog/2026-discord',
    destination: '/zh/blog/discord-style-chat-video-tutorial',
    statusCode: 301,
  },
  {
    source:
      '/blog/the-best-fake-discord-chat-generator-for-videos-no-watermark-100-safe',
    destination: '/blog/discord-style-chat-video-guide',
    statusCode: 301,
  },
  {
    source: '/zh/blog/whatsapp',
    destination: '/zh/blog/whatsapp-style-conversation-mockup-guide',
    statusCode: 301,
  },
  {
    source: '/blog/how-to-create-fake-whatsapp-conversation-online-free',
    destination: '/blog/whatsapp-style-conversation-mockup-online',
    statusCode: 301,
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone',
  reactStrictMode: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  images: {
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    qualities: [60, 70, 75],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      },
    ],
  },
  async redirects() {
    return legacyBlogRedirects;
  },
  async headers() {
    return [
      {
        source: '/imgs/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Keep packages with workerd-specific entrypoints external so OpenNext can
  // resolve the correct runtime variant for Cloudflare Workers.
  serverExternalPackages: [
    '@libsql/client',
    '@libsql/isomorphic-ws',
    'postgres',
  ],
  turbopack: {
    resolveAlias: {
      // fs: {
      //   browser: './empty.ts', // We recommend to fix code imports before using this method
      // },
    },
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  reactCompiler: false,
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
