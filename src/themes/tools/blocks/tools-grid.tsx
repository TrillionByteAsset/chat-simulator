import React from 'react';
import { Link } from '@/core/i18n/navigation';

interface ToolCard {
  name: string;
  description: string;
  icon: string;
  href: string;
  tags?: string[];
}

interface ToolsGridSection {
  title?: string;
  tools?: ToolCard[];
}

// 预定义的工具列表 —— 与 src/tools/ 下已有的工具保持同步
// 后续可以改为动态读取 manifest.json
const DEFAULT_TOOLS: ToolCard[] = [
  {
    name: 'Discord Chat Simulator',
    description: 'Create incredibly realistic fake Discord chat conversations with dark theme, message stacking, and role badges.',
    icon: '💬',
    href: '/tools/chat-simulator',
    tags: ['Chat', 'Discord', 'Generator'],
  },
  {
    name: 'WhatsApp Chat Generator',
    description: 'Generate authentic WhatsApp conversations with green bubbles, double-check marks, and end-to-end encryption notice.',
    icon: '📱',
    href: '/tools/whatsapp-simulator',
    tags: ['Chat', 'WhatsApp', 'Social'],
  },
  {
    name: 'WeChat Chat Generator',
    description: 'Create realistic WeChat chat screenshots with proper Chinese social media styling and payment dialogs.',
    icon: '🟢',
    href: '/tools/wechat-simulator',
    tags: ['Chat', 'WeChat', 'Social'],
  },
  {
    name: 'iMessage Generator',
    description: 'Generate convincing iMessage conversations with blue and gray bubble styling, delivered/read receipts.',
    icon: '🍎',
    href: '/tools/imessage-simulator',
    tags: ['Chat', 'Apple', 'iOS'],
  },
  {
    name: 'Telegram Chat Generator',
    description: 'Create Telegram-style chat screenshots with cloud-based messaging aesthetics and inline keyboard buttons.',
    icon: '✈️',
    href: '/tools/telegram-simulator',
    tags: ['Chat', 'Telegram', 'Social'],
  },
  {
    name: 'Slack Chat Generator',
    description: 'Generate professional Slack workspace conversations for demos, presentations, and social media content.',
    icon: '🏢',
    href: '/tools/slack-simulator',
    tags: ['Chat', 'Slack', 'Business'],
  },
];

/**
 * ToolsGrid Block: 工具主题首页的工具展示网格
 * 3 列响应式卡片布局，每张卡片展示工具名称、描述和标签
 */
export function ToolsGrid({ section }: { section?: ToolsGridSection }) {
  const title = section?.title || 'All Tools';
  const tools = section?.tools || DEFAULT_TOOLS;

  return (
    <section className="container pb-20">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
        <p className="mt-2 text-muted-foreground">
          Pick a tool to get started — no sign-up required.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, idx) => (
          <Link
            key={idx}
            href={tool.href}
            className="group relative flex flex-col rounded-xl border border-foreground/5 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1"
          >
            {/* Icon */}
            <div className="mb-4 text-3xl">{tool.icon}</div>

            {/* Title */}
            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
              {tool.name}
            </h3>

            {/* Description */}
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
              {tool.description}
            </p>

            {/* Tags */}
            {tool.tags && tool.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {tool.tags.map((tag, tidx) => (
                  <span
                    key={tidx}
                    className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Arrow indicator */}
            <span className="absolute top-6 right-6 text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
