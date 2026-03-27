'use client';

import React from 'react';

interface HeroSection {
  title?: string;
  highlight?: string;
  description?: string;
}

/**
 * ToolsHero Block: 工具主题首页英雄区
 * 大标题 + 描述 + 引导文字
 */
export function ToolsHero({ section }: { section?: HeroSection }) {
  const title = section?.title || 'Online Tools';
  const highlight = section?.highlight || 'Collection';
  const description =
    section?.description ||
    'A curated collection of powerful, free online tools. Generate realistic chat screenshots, create mock conversations, and much more — all in your browser.';

  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-20">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <div className="container text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {title}{' '}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {highlight}
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </section>
  );
}
