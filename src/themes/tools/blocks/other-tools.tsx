import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { getToolManifest } from '@/core/tooling-engine/DynamicLoader';

/**
 * OtherTools Block: 工具主题的“其他工具推荐”区块
 * - 由 manifest.recommendations 驱动配置
 * - 如果 recommendations 不存在，则不渲染（返回 null）
 * - 如果 recommendations 存在但 tools 为空，则保留模块插槽，不渲染内容
 * - 按需渲染 title 和 description，然后渲染工具卡片
 */
export async function OtherTools({ toolName }: { toolName?: string }) {
  const targetTool = toolName || envConfigs.default_tool || 'chat-simulator';
  const manifest = await getToolManifest(targetTool);

  const recommendations = manifest?.recommendations;
  
  if (!recommendations) {
    return null;
  }

  const { title, description, tools = [] } = recommendations;

  if (tools.length === 0) {
    return <section className="container" data-recommendations-slot="true" aria-hidden="true" />;
  }

  return (
    <section className="container py-12 md:py-16">
      {/* 头部：标题与描述 */}
      <div className="mb-10 text-center">
        {title && <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>}
        {description && <p className="mt-2 text-lg text-muted-foreground">{description}</p>}
      </div>

      {/* 推介网格 */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, idx) => {
          // 根据 target 决定渲染属性
          const target = tool.target || '_self';
          const isExternal = tool.url.startsWith('http') || target === '_blank';

          return (
            <Link
              key={idx}
              href={tool.url}
              target={target}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="group flex flex-col rounded-xl border border-foreground/5 bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-foreground/10 hover:-translate-y-0.5"
            >
              {tool.icon && <div className="mb-3 text-2xl">{tool.icon}</div>}
              <h3 className="text-base font-semibold group-hover:text-primary transition-colors">
                {tool.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed flex-1">
                {tool.description}
              </p>
              <span className="mt-3 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                Try it <span>&rarr;</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
