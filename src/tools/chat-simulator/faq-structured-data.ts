import { envConfigs } from '@/config';
import { defaultLocale } from '@/config/locale';
import type { ToolManifest } from '@/core/tooling-engine/types';

import { isChineseLocale } from './localization';

interface ChatSimulatorFaqStructuredDataOptions {
  canonicalPath: string;
  locale?: string;
  manifest: ToolManifest;
}

function buildAbsoluteUrl(path: string) {
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

export function getChatSimulatorFaqStructuredData({
  canonicalPath,
  locale,
  manifest,
}: ChatSimulatorFaqStructuredDataOptions) {
  const isZh = isChineseLocale(locale);

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: buildLocalizedUrl(canonicalPath, locale),
    name: isZh ? `${manifest.name} 常见问题` : `${manifest.name} FAQ`,
    mainEntity: isZh
      ? [
          {
            '@type': 'Question',
            name: `${manifest.name} 是做什么的？`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${manifest.name} 是一个实用型网页工具，用来创建逼真的聊天截图和对话演示，不需要复杂的前置配置。`,
            },
          },
          {
            '@type': 'Question',
            name: '我输入的内容会被网站保存吗？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '正常使用时，工具内容会尽量优先在浏览器或本地设备中处理，产品本身并不是为了归档你的聊天内容或创作内容而设计的。',
            },
          },
          {
            '@type': 'Question',
            name: '使用这个工具需要注册账号吗？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '公开工具页通常可以直接使用，不需要先登录。如果未来某些功能需要账号、同步或服务端处理，会在对应功能中单独说明。',
            },
          },
          {
            '@type': 'Question',
            name: '导出是在本地完成的吗？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '预览、编辑和导出等核心操作会尽量保持在本地完成，以减少不必要的上传和服务端依赖。',
            },
          },
          {
            '@type': 'Question',
            name: '网站会显示广告吗？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '网站可能会使用 Google AdSense 或其他合规广告服务来支持持续运营。启用广告后，第三方可能使用 Cookie 或类似技术来展示和衡量广告效果。',
            },
          },
          {
            '@type': 'Question',
            name: '网站会使用 Cookie 吗？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '会。网站可能会使用 Cookie、本地存储或类似技术来支持必要功能、记录偏好、进行基础分析以及支持广告展示。',
            },
          },
          {
            '@type': 'Question',
            name: '如何联系站点维护者？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '你可以通过 info@chat-simulator.top 联系站点维护者，提交支持请求、反馈、合作或合规相关问题。',
            },
          },
        ]
      : [
          {
            '@type': 'Question',
            name: `What is ${manifest.name} for?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${manifest.name} is a practical web tool for creating realistic chat screenshots and mock conversations without a heavy setup flow.`,
            },
          },
          {
            '@type': 'Question',
            name: 'Is the content I enter stored by the website?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Under normal use, content entered into the tool is intended to be handled locally in your browser or on your device whenever possible. The product is not designed around building archives of your working content.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do I need an account to use it?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Public tool pages are generally intended to be usable without requiring sign-in first. If a future feature depends on account access, synchronization, or server-side processing, that will be disclosed within that feature flow.',
            },
          },
          {
            '@type': 'Question',
            name: 'Are exports handled locally?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Core interactions such as previewing, editing, and exporting are designed to stay as local as possible in order to reduce unnecessary uploads and server dependence.',
            },
          },
          {
            '@type': 'Question',
            name: 'Will the website show ads?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The site may use Google AdSense or other compliant advertising services to support ongoing operation and infrastructure costs. When advertising is enabled, third parties may use cookies or similar technologies to serve and measure ads.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does the site use cookies?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. The site may use cookies, local storage, or similar technologies for essential functionality, preference handling, basic analytics, and advertising support.',
            },
          },
          {
            '@type': 'Question',
            name: 'How can I contact the site owner?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'You can email info@chat-simulator.top for support, feedback, business inquiries, or compliance-related questions.',
            },
          },
        ],
  };
}
