import { getLocale } from 'next-intl/server';

import { Link } from '@/core/i18n/navigation';
import { ToolManifest, ToolNavItem } from '@/core/tooling-engine/types';

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
  const footerGroups = dedupeFooterGroups(manifest.footer?.groups || []);
  const defaultColumns: Array<{ title: string; items: ToolNavItem[] }> = [
    {
      title: isZh ? '关于' : 'About',
      items: [
        { title: isZh ? '关于我们' : 'About Us', url: '/about' },
        { title: isZh ? '常见问题' : 'FAQ', url: '/faq' },
        {
          title: isZh ? '联系邮箱' : 'Contact',
          url: `mailto:${CONTACT_EMAIL}`,
        },
      ],
    },
    {
      title: isZh ? '法律' : 'Legal',
      items: [
        { title: isZh ? '隐私政策' : 'Privacy', url: '/privacy' },
        { title: isZh ? '服务条款' : 'Terms', url: '/terms' },
      ],
    },
  ];
  const footerColumns =
    footerGroups.length > 0
      ? [
          ...footerGroups.map((group) => ({
            title: group.title,
            items: group.items,
          })),
          ...defaultColumns,
        ]
      : defaultColumns;
  const bottomLegalLinks = [
    { title: isZh ? '条款' : 'Terms', url: '/terms' },
    { title: isZh ? '隐私' : 'Privacy', url: '/privacy' },
    { title: 'FAQ', url: '/faq' },
  ];
  const primaryNote = isZh
    ? '生成的聊天截图仅用于演示、创意或说明场景，正式发布前请自行核对信息。'
    : 'Generated chat screenshots are intended for mockups, demos, and creative use. Please verify important information before publishing.';
  const secondaryNote = isZh
    ? '上传的头像、图片和文件在正常使用中默认仅在浏览器本地处理，不会作为站点内容资产保存到服务器。'
    : 'Uploaded avatars, images, and files are handled locally in the browser during normal use and are not stored on the server as site content assets.';

  return (
    <footer className="overflow-x-hidden pt-12 pb-8 sm:pt-14 sm:pb-9">
      <div className="container overflow-x-hidden">
        <div className="border-foreground/8 grid gap-10 border-b pb-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-14">
          <div className="max-w-sm min-w-0">
            <p className="text-foreground text-[15px] font-semibold">
              {manifest.name}
            </p>
            <p className="text-muted-foreground mt-4 text-[15px] leading-7">
              {manifest.seo?.description}
            </p>
          </div>

          {footerColumns.map((column, idx) => (
            <div key={`${column.title}-${idx}`} className="min-w-0">
              <p className="text-foreground text-[15px] font-semibold">
                {column.title}
              </p>
              <div className="mt-4 flex flex-col gap-3.5">
                {column.items.map((item, itemIdx) => {
                  const isMailto = item.url.startsWith('mailto:');
                  const isExternal =
                    item.url.startsWith('http://') ||
                    item.url.startsWith('https://');
                  const target =
                    item.target || (isExternal || isMailto ? '_blank' : '_self');
                  const rel = target === '_blank' ? 'noreferrer' : undefined;

                  return isMailto ? (
                    <a
                      key={`${item.title}-${itemIdx}`}
                      href={item.url}
                      title={item.title}
                      target={target}
                      rel={rel}
                      className="text-muted-foreground hover:text-foreground text-[15px] leading-6 transition-colors duration-150"
                    >
                      {item.title}
                    </a>
                  ) : (
                    <Link
                      key={`${item.title}-${itemIdx}`}
                      href={item.url || ''}
                      title={item.title}
                      target={target}
                      rel={rel}
                      className="text-muted-foreground hover:text-foreground text-[15px] leading-6 transition-colors duration-150"
                    >
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 pt-7 text-center sm:space-y-4 sm:pt-8">
          <p className="text-muted-foreground text-sm leading-6">
            {primaryNote}
          </p>
          <p className="text-muted-foreground/90 text-sm leading-6">
            {secondaryNote}
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 leading-6">
            <span>
              © {new Date().getFullYear()} {manifest.name}
            </span>
            <span className="hidden sm:inline">•</span>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              target="_blank"
              rel="noreferrer"
              title={isZh ? '联系邮箱' : 'Contact'}
              className="hover:text-foreground transition-colors duration-150"
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {bottomLegalLinks.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                title={item.title}
                target="_self"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-150"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
