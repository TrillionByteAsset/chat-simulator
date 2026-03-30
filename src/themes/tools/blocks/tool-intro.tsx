import MarkdownIt from 'markdown-it';
import 'github-markdown-css/github-markdown.css';

import { envConfigs } from '@/config';
import { getToolManifest } from '@/core/tooling-engine/DynamicLoader';

// 初始化 Markdown 解析器
const md = new MarkdownIt({ html: true, breaks: true });

/**
 * ToolIntro Block: 工具主题的“使用方式”介绍区块
 * - 由 manifest.usage 驱动配置
 * - 如果没有配置 usage，或者 usage 内部无任何内容，则不渲染（返回 null）
 * - 按需渲染 title、description 和 markdown 语法支持的 content
 */
export async function ToolIntro({ toolName }: { toolName?: string }) {
  const targetTool = toolName || envConfigs.default_tool || 'chat-simulator';
  const manifest = await getToolManifest(targetTool);

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
        className={`rounded-[28px] border border-foreground/10 bg-card/90 p-7 shadow-[0_24px_70px_-38px_rgba(0,0,0,0.45)] backdrop-blur md:p-10 ${cardClassName}`}
      >
        <div className="[font-family:ui-sans-serif,system-ui,sans-serif]">
          <p className="text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-primary/75">
            {eyebrow}
          </p>

          {hasTitle ? (
            <h2 className="mt-3 font-serif text-[2.05rem] leading-[1.14] tracking-[-0.025em] text-foreground md:text-[2.75rem]">
              {title}
            </h2>
          ) : null}

          {hasDesc ? (
            <p
              className={`text-[15px] leading-[1.92] tracking-[0.002em] text-muted-foreground md:text-[16px] md:leading-[1.98] ${
                hasTitle ? 'mt-4' : 'mt-2'
              }`}
            >
              {description}
            </p>
          ) : null}

          {hasContent ? (
            <div className={hasDesc || hasTitle ? 'mt-8' : ''}>
              <div
                className="markdown-body !bg-transparent !text-inherit [font-family:ui-sans-serif,system-ui,sans-serif] text-[15px] leading-[1.94] tracking-[0.002em] text-foreground md:text-[16px] md:leading-[2] [&_.highlight]:!bg-transparent [&_blockquote]:rounded-2xl [&_blockquote]:border-0 [&_blockquote]:bg-muted/60 [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:text-muted-foreground [&_blockquote_p]:!my-0 [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.92em] [&_h3]:mb-4 [&_h3]:mt-0 [&_h3]:font-serif [&_h3]:text-[1.85rem] [&_h3]:leading-[1.22] [&_h3]:tracking-[-0.024em] [&_h4]:mb-3 [&_h4]:mt-8 [&_h4]:text-[1.04rem] [&_h4]:font-semibold [&_h4]:tracking-[-0.01em] [&_hr]:my-8 [&_hr]:border-foreground/10 [&_li]:my-3.5 [&_ol]:my-5 [&_ol]:pl-6 [&_p]:my-5 [&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-foreground/10 [&_pre]:bg-muted [&_pre]:p-4 [&_strong]:font-semibold [&_strong]:tracking-[0.003em] [&_ul]:my-5 [&_ul]:pl-6"
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
              eyebrow: 'How To Use',
              title: usage.title,
              description: usage.description,
              html: htmlContent,
            })
          : null}

        {hasRoadmap
          ? renderSection({
              eyebrow: 'Platform Roadmap',
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
