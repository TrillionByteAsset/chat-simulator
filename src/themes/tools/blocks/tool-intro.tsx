import MarkdownIt from 'markdown-it';

import { getLocalizedToolManifest } from '@/tools/shared/localized-tool-manifest';
import { getLocale } from 'next-intl/server';

import { getToolManifest } from '@/core/tooling-engine/DynamicLoader';
import { envConfigs } from '@/config';

// 初始化 Markdown 解析器
const md = new MarkdownIt({ html: true, breaks: true });

/**
 * ToolIntro Block: 工具主题的“使用方式”介绍区块
 * - 由 manifest.usage 驱动配置
 * - 如果没有配置 usage，或者 usage 内部无任何内容，则不渲染（返回 null）
 * - 按需渲染 title、description 和 markdown 语法支持的 content
 */
export async function ToolIntro({ toolName }: { toolName?: string }) {
  const locale = await getLocale();
  const targetTool = toolName || envConfigs.default_tool || 'chat-simulator';
  const manifest = getLocalizedToolManifest(
    await getToolManifest(targetTool),
    locale
  );

  const usage = manifest?.usage;
  const platformRoadmap = manifest?.platformRoadmap;

  const hasUsage = !!(usage?.title || usage?.description || usage?.content);
  const hasRoadmap = !!(
    platformRoadmap?.title ||
    platformRoadmap?.description ||
    platformRoadmap?.content
  );

  if (!hasUsage && !hasRoadmap) {
    return null;
  }

  const htmlContent = usage?.content ? md.render(usage.content) : '';
  const roadmapHtmlContent = platformRoadmap?.content
    ? md.render(platformRoadmap.content)
    : '';

  const renderSection = ({
    eyebrow,
    title,
    description,
    html,
    cardClassName = '',
  }: {
    eyebrow: string;
    title?: string;
    description?: string;
    html?: string;
    cardClassName?: string;
  }) => {
    const hasTitle = !!title;
    const hasDesc = !!description;
    const hasContent = !!html;

    if (!hasTitle && !hasDesc && !hasContent) {
      return null;
    }

    return (
      <div
        className={`border-foreground/10 bg-card/90 rounded-[28px] border p-7 shadow-[0_24px_70px_-38px_rgba(0,0,0,0.45)] backdrop-blur md:p-10 ${cardClassName}`}
      >
        <div className="[font-family:ui-sans-serif,system-ui,sans-serif]">
          <p className="text-primary/75 text-[0.76rem] font-semibold tracking-[0.14em] uppercase">
            {eyebrow}
          </p>

          {hasTitle ? (
            <h2 className="text-foreground mt-3 font-serif text-[2.05rem] leading-[1.14] tracking-[-0.025em] md:text-[2.75rem]">
              {title}
            </h2>
          ) : null}

          {hasDesc ? (
            <p
              className={`text-muted-foreground text-[15px] leading-[1.92] tracking-[0.002em] md:text-[16px] md:leading-[1.98] ${
                hasTitle ? 'mt-4' : 'mt-2'
              }`}
            >
              {description}
            </p>
          ) : null}

          {hasContent ? (
            <div className={hasDesc || hasTitle ? 'mt-8' : ''}>
              <div
                className="markdown-body text-foreground [&_blockquote]:bg-muted/60 [&_blockquote]:text-muted-foreground [&_code]:bg-muted [&_hr]:border-foreground/10 [&_pre]:border-foreground/10 [&_pre]:bg-muted !bg-transparent [font-family:ui-sans-serif,system-ui,sans-serif] text-[15px] leading-[1.94] tracking-[0.002em] !text-inherit md:text-[16px] md:leading-[2] [&_.highlight]:!bg-transparent [&_blockquote]:rounded-2xl [&_blockquote]:border-0 [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote_p]:!my-0 [&_code]:rounded-md [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.92em] [&_h2]:mt-0 [&_h2]:mb-5 [&_h2]:font-serif [&_h2]:text-[2rem] [&_h2]:leading-[1.18] [&_h2]:tracking-[-0.025em] [&_h2:not(:first-child)]:mt-12 [&_h3]:mt-8 [&_h3]:mb-4 [&_h3]:font-serif [&_h3]:text-[1.55rem] [&_h3]:leading-[1.24] [&_h3]:tracking-[-0.02em] [&_h4]:mt-8 [&_h4]:mb-3 [&_h4]:text-[1.04rem] [&_h4]:font-semibold [&_h4]:tracking-[-0.01em] [&_hr]:my-8 [&_li]:my-3.5 [&_ol]:my-5 [&_ol]:pl-6 [&_p]:my-5 [&_pre]:rounded-2xl [&_pre]:border [&_pre]:p-4 [&_strong]:font-semibold [&_strong]:tracking-[0.003em] [&_ul]:my-5 [&_ul]:pl-6"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <section className="container pt-4 pb-12 md:pt-4 md:pb-16">
      <div className="space-y-8">
        {hasUsage
          ? renderSection({
              eyebrow: locale.toLowerCase().startsWith('zh')
                ? '如何使用'
                : 'How To Use',
              title: usage.title,
              description: usage.description,
              html: htmlContent,
            })
          : null}

        {hasRoadmap
          ? renderSection({
              eyebrow: locale.toLowerCase().startsWith('zh')
                ? '未来功能'
                : 'Platform Roadmap',
              title: platformRoadmap?.title,
              description: platformRoadmap?.description,
              html: roadmapHtmlContent,
              cardClassName:
                'border-primary/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.72))]',
            })
          : null}
      </div>
    </section>
  );
}
