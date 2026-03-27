import React from 'react';

interface ToolIntroSection {
  title?: string;
  description?: string;
  features?: Array<{
    icon?: string;
    title: string;
    description: string;
  }>;
}

/**
 * ToolIntro Block: UE 线框中的"工具功能介绍（图文）"
 * 展示工具的功能特点、使用说明等富文本介绍内容
 */
export function ToolIntro({ section }: { section?: ToolIntroSection }) {
  const title = section?.title || 'How It Works';
  const description = section?.description || 'Create realistic chat conversations in seconds with our powerful simulation engine.';
  const features = section?.features || [
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Generate complete chat conversations instantly with our optimized engine.',
    },
    {
      icon: '🎨',
      title: 'Multiple Skins',
      description: 'Switch between Discord, WhatsApp, WeChat and more with a single config change.',
    },
    {
      icon: '📱',
      title: 'Fully Responsive',
      description: 'Perfect rendering on any device — desktop, tablet, or mobile.',
    },
    {
      icon: '🔌',
      title: 'Plug & Play',
      description: 'Copy the tool folder to any compatible project and it works instantly.',
    },
  ];

  return (
    <section className="container py-12 md:py-16">
      <div className="mx-auto max-w-3xl text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
        <p className="mt-4 text-lg text-muted-foreground">{description}</p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-xl border border-foreground/5 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-foreground/10"
          >
            <div className="mb-3 text-3xl">{feature.icon}</div>
            <h3 className="text-lg font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
