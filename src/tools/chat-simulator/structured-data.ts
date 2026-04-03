import { envConfigs } from '@/config';
import { defaultLocale } from '@/config/locale';
import type { ToolManifest } from '@/core/tooling-engine/types';

import { isChineseLocale } from './localization';

interface ChatSimulatorStructuredDataOptions {
  canonicalPath: string;
  locale?: string;
  manifest: ToolManifest;
}

function buildAbsoluteUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedBase = envConfigs.app_url.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
}

function buildLocalizedUrl(path: string, locale?: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!locale || locale === defaultLocale) {
    return buildAbsoluteUrl(normalizedPath);
  }

  return buildAbsoluteUrl(`/${locale}${normalizedPath}`);
}

export function getChatSimulatorStructuredData({
  canonicalPath,
  locale,
  manifest,
}: ChatSimulatorStructuredDataOptions) {
  const isZh = isChineseLocale(locale);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: manifest.name,
    url: buildLocalizedUrl(canonicalPath, locale),
    image: buildAbsoluteUrl(envConfigs.app_logo),
    description: manifest.seo.description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: isZh
      ? '需要启用 JavaScript 的现代浏览器。'
      : 'Requires a modern web browser with JavaScript enabled.',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: isZh
      ? [
          '创建逼真的聊天截图',
          '支持 Discord、WhatsApp、Telegram 和自定义模式',
          '编辑消息、头像、名称、时间和背景',
          '上传本地图片和附件',
          '导出前预览聊天回放效果',
          '支持导出 PNG 或 JPG 聊天图片',
        ]
      : [
          'Create realistic chat screenshots',
          'Support for Discord, WhatsApp, Telegram, and Custom mode',
          'Edit messages, avatars, names, timestamps, and backgrounds',
          'Upload local images and attachments',
          'Preview chat playback before export',
          'Export chat screenshots in PNG or JPG format',
        ],
  };
}
