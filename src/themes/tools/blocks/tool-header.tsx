'use client';

import { ToolManifest } from '@/core/tooling-engine/types';
import { Link } from '@/core/i18n/navigation';

/**
 * ToolHeader: 工具主题的自定义导航栏
 * - 始终显示 LOGO（logo 图片 + 工具名称）
 * - manifest.header.nav 不存在时 → 只显示 LOGO
 * - 存在时 → 左侧 LOGO + 右侧导航链接
 * 
 * LOGO 优先级：manifest.header.logo > 默认 /logo.webp
 */
export function ToolHeader({ manifest }: { manifest: ToolManifest }) {
  const hasNav = manifest.header?.nav && manifest.header.nav.length > 0;
  const logoSrc = manifest.header?.logo || '/logo.webp';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-foreground/5 bg-background/75 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        {/* 左侧：LOGO 图片 + 工具名称 */}
        <Link href="/" title={manifest.name} className="flex items-center space-x-2.5">
          <img
            src={logoSrc}
            alt={manifest.name}
            className="h-8 w-auto object-contain"
          />
          <span className="text-lg font-medium">{manifest.name}</span>
        </Link>

        {/* 右侧：导航链接（仅在配置时显示） */}
        {hasNav && (
          <nav className="flex items-center gap-6">
            {manifest.header!.nav!.map((item, idx) => (
              <Link
                key={idx}
                href={item.url || ''}
                title={item.title}
                target={item.target || '_self'}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
