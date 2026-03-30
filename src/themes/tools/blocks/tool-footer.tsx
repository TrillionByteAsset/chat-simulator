import { getLocale } from 'next-intl/server';

import { Link } from '@/core/i18n/navigation';
import { ToolManifest } from '@/core/tooling-engine/types';
import { envConfigs } from '@/config';

const CONTACT_EMAIL = 'info@chat-simulator.top';

function dedupeFooterGroups(
  groups: NonNullable<ToolManifest['footer']>['groups']
) {
  if (!groups) {
    return [];
  }

  const seen = new Set<string>();

  return groups
    .map((group) => {
      const items = group.items.filter((item) => {
        const key = `${item.title}:${item.url}:${item.target || '_self'}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });

      return {
        ...group,
        items,
      };
    })
    .filter((group) => group.items.length > 0);
}

/**
 * ToolFooter: 工具主题的自定义底部内容栏
 *
 * 无配置时：横向展示 SEO title + description（单行/双行居左）
 * 有配置时：自动适配渲染块大小
 *   - 左侧自适应：SEO title + description
 *   - 右侧自适应：按分组渲染链接列表
 * 底部：分割线 + 版权
 */
export async function ToolFooter({ manifest }: { manifest: ToolManifest }) {
  const locale = await getLocale();
  const isZh = locale.toLowerCase().startsWith('zh');
  const toolName = envConfigs.default_tool || 'chat-simulator';
  const seoTitle = manifest.seo?.title || manifest.name;
  const seoDescription = manifest.seo?.description || '';
  const footerGroups = dedupeFooterGroups(manifest.footer?.groups || []);
  const hasGroups = footerGroups && footerGroups.length > 0;
  const footerMetaSections = [
    {
      label: isZh ? '关于' : 'About',
      links: [
        {
          title: isZh ? '关于我们' : 'About Us',
          url: `/tools/${toolName}/about`,
        },
      ],
    },
    {
      label: isZh ? '法律' : 'Legal',
      links: [
        {
          title: isZh ? '隐私政策' : 'Privacy Policy',
          url: `/tools/${toolName}/privacy`,
        },
      ],
    },
  ];

  return (
    <footer className="overflow-x-hidden py-8 sm:py-8">
      <div className="container space-y-8 overflow-x-hidden">
        {/* 主体区域 */}
        {hasGroups ? (
          /* 有配置：左侧 SEO + 右侧分组链接，自动适配列数 */
          <div className="flex min-w-0 flex-col gap-12 md:flex-row">
            {/* 左侧：SEO 信息 */}
            <div className="min-w-0 shrink-0 space-y-3 break-words md:max-w-xs lg:max-w-sm">
              <span className="block text-base font-semibold break-words">
                {seoTitle}
              </span>
              {seoDescription && (
                <p className="text-muted-foreground text-sm text-balance break-words">
                  {seoDescription}
                </p>
              )}
              <div className="flex flex-wrap gap-3 pt-3">
                {footerMetaSections.map((section) => (
                  <div
                    key={section.label}
                    className="border-foreground/10 bg-muted/35 min-w-[140px] rounded-2xl border px-4 py-3 shadow-sm"
                  >
                    <p className="text-foreground text-sm font-semibold tracking-[0.08em] uppercase">
                      {section.label}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {section.links.map((item) => (
                        <Link
                          key={item.url}
                          href={item.url}
                          target="_blank"
                          className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors duration-150"
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 右侧：分组链接，根据组数自动适配列数 */}
            <div
              className="grid min-w-0 flex-1 gap-6"
              style={{
                gridTemplateColumns: `repeat(${Math.min(footerGroups.length, 3)}, minmax(0, 1fr))`,
              }}
            >
              {footerGroups.map((group, idx) => (
                <div
                  key={idx}
                  className="min-w-0 space-y-4 text-sm break-words"
                >
                  <span className="block font-medium break-words">
                    {group.title}
                  </span>
                  <div className="flex min-w-0 flex-wrap gap-4 sm:flex-col">
                    {group.items?.map((item, iidx) => (
                      <Link
                        key={iidx}
                        href={item.url || ''}
                        target={item.target || '_self'}
                        className="text-muted-foreground hover:text-primary block break-words duration-150"
                      >
                        <span className="break-words">{item.title || ''}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 无配置：横向展示 SEO 信息 */
          <div className="min-w-0 space-y-3 break-words">
            <span className="block text-base font-semibold break-words">
              {seoTitle}
            </span>
            {seoDescription && (
              <p className="text-muted-foreground text-sm break-words">
                {seoDescription}
              </p>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              {footerMetaSections.map((section) => (
                <div
                  key={section.label}
                  className="border-foreground/10 bg-muted/35 min-w-[140px] rounded-2xl border px-4 py-3 shadow-sm"
                >
                  <p className="text-foreground text-sm font-semibold tracking-[0.08em] uppercase">
                    {section.label}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {section.links.map((item) => (
                      <Link
                        key={item.url}
                        href={item.url}
                        target="_blank"
                        className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors duration-150"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 分割线 */}
        <div
          aria-hidden
          className="h-px min-w-0 [background-image:linear-gradient(90deg,var(--color-foreground)_1px,transparent_1px)] bg-[length:6px_1px] bg-repeat-x opacity-25"
        />

        {/* 底部版权 */}
        <div className="flex min-w-0 flex-wrap justify-between gap-8">
          <p className="text-muted-foreground text-sm text-balance break-words">
            © {new Date().getFullYear()} {manifest.name}. All rights reserved.
          </p>

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-muted-foreground hover:text-primary text-sm break-words duration-150"
          >
            {isZh ? '联系邮箱：' : 'Contact: '}
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
}
