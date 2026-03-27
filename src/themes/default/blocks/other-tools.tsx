import React from 'react';
import { Link } from '@/core/i18n/navigation';

interface OtherTool {
  name: string;
  description: string;
  icon?: string;
  href: string;
}

interface OtherToolsSection {
  title?: string;
  tools?: OtherTool[];
}

/**
 * OtherTools Block: UE 线框中的"其他工具"网格区域
 * 3 列布局的工具卡片推荐区
 */
export function OtherTools({ section }: { section?: OtherToolsSection }) {
  const title = section?.title || 'Explore More Tools';
  const tools: OtherTool[] = section?.tools || [
    {
      name: 'WhatsApp Chat Generator',
      description: 'Create realistic WhatsApp conversations with green bubbles and double-check marks.',
      icon: '💬',
      href: '/tools/whatsapp-chat-simulator',
    },
    {
      name: 'WeChat Chat Generator',
      description: 'Generate authentic WeChat chat screenshots with proper Chinese social media styling.',
      icon: '🟢',
      href: '/tools/wechat-chat-simulator',
    },
    {
      name: 'iMessage Generator',
      description: 'Create convincing iMessage conversations with blue and gray bubble styling.',
      icon: '📱',
      href: '/tools/imessage-simulator',
    },
    {
      name: 'Telegram Chat Generator',
      description: 'Generate Telegram-style chat screenshots with cloud-based messaging aesthetics.',
      icon: '✈️',
      href: '/tools/telegram-simulator',
    },
    {
      name: 'Slack Chat Generator',
      description: 'Create professional Slack workspace conversations for demos and presentations.',
      icon: '🏢',
      href: '/tools/slack-simulator',
    },
    {
      name: 'Twitter DM Generator',
      description: 'Generate realistic Twitter direct message conversations with verified badges.',
      icon: '🐦',
      href: '/tools/twitter-dm-simulator',
    },
  ];

  return (
    <section className="container py-12 md:py-16">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, idx) => (
          <Link
            key={idx}
            href={tool.href}
            className="group flex flex-col rounded-xl border border-foreground/5 bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-foreground/10 hover:-translate-y-0.5"
          >
            <div className="mb-3 text-2xl">{tool.icon}</div>
            <h3 className="text-base font-semibold group-hover:text-primary transition-colors">
              {tool.name}
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed flex-1">
              {tool.description}
            </p>
            <span className="mt-3 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Try it →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
