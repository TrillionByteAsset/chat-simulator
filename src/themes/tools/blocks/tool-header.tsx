'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLocale } from 'next-intl';

import { Link } from '@/core/i18n/navigation';
import { ToolManifest } from '@/core/tooling-engine/types';

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
  const locale = useLocale();
  const isZh = locale.toLowerCase().startsWith('zh');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-foreground/8 bg-background/95 relative sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        {/* 左侧：LOGO 图片 + 工具名称 */}
        <Link
          href="/"
          title={manifest.name}
          className="flex min-w-0 items-center space-x-2.5"
        >
          <img
            src={logoSrc}
            alt={manifest.name}
            className="h-8 w-auto shrink-0 object-contain"
          />
          <span className="truncate text-lg font-medium">{manifest.name}</span>
        </Link>

        {/* 右侧：导航链接（仅在配置时显示） */}
        {hasNav && (
          <>
            <nav
              className="hidden items-center gap-7 md:flex"
              aria-label={isZh ? '主导航' : 'Primary navigation'}
            >
              {manifest.header!.nav!.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.url || ''}
                  title={item.title}
                  target={item.target || '_self'}
                  className="text-foreground/82 hover:text-foreground text-[0.96rem] font-semibold tracking-[0.01em] transition-colors duration-150"
                >
                  {item.title}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              className="text-foreground inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg md:hidden"
              aria-controls="mobile-primary-navigation"
              aria-expanded={isMenuOpen}
              aria-label={
                isMenuOpen
                  ? isZh
                    ? '关闭导航菜单'
                    : 'Close navigation menu'
                  : isZh
                    ? '打开导航菜单'
                    : 'Open navigation menu'
              }
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            {isMenuOpen ? (
              <nav
                id="mobile-primary-navigation"
                className="bg-background border-foreground/10 absolute top-full right-0 left-0 grid gap-1 border-b p-3 shadow-lg md:hidden"
                aria-label={isZh ? '移动端主导航' : 'Mobile primary navigation'}
              >
                {manifest.header!.nav!.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.url || ''}
                    title={item.title}
                    target={item.target || '_self'}
                    className="hover:bg-muted rounded-lg px-3 py-2.5 text-sm font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            ) : null}
          </>
        )}
      </div>
    </header>
  );
}
