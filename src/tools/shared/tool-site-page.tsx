import MarkdownIt from 'markdown-it';

import 'github-markdown-css/github-markdown.css';

import type { ToolManifest } from '@/core/tooling-engine/types';

import {
  getToolSitePageContent,
  type ToolSitePageKind,
} from './tool-site-page-content';

const md = new MarkdownIt({ html: true, breaks: true, linkify: true });

export function ToolSitePage({
  kind,
  locale,
  manifest,
}: {
  kind: ToolSitePageKind;
  locale?: string;
  manifest: ToolManifest;
}) {
  const page = getToolSitePageContent({ kind, locale, manifest });
  const html = md.render(page.content);

  return (
    <section className="container py-8 md:py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="border-foreground/10 bg-card/90 rounded-[28px] border p-7 shadow-[0_24px_70px_-38px_rgba(0,0,0,0.45)] backdrop-blur md:p-10">
          <div className="[font-family:ui-sans-serif,system-ui,sans-serif]">
            <p className="text-primary/75 text-[0.76rem] font-semibold tracking-[0.14em] uppercase">
              {page.eyebrow}
            </p>

            <h1 className="text-foreground mt-3 font-serif text-[2.05rem] leading-[1.14] tracking-[-0.025em] md:text-[2.75rem]">
              {page.title}
            </h1>

            <p className="text-muted-foreground mt-4 text-[15px] leading-[1.92] tracking-[0.002em] md:text-[16px] md:leading-[1.98]">
              {page.description}
            </p>

            <div className="mt-8">
              <div
                className="markdown-body text-foreground [&_blockquote]:bg-muted/60 [&_blockquote]:text-muted-foreground [&_code]:bg-muted [&_hr]:border-foreground/10 [&_pre]:border-foreground/10 [&_pre]:bg-muted !bg-transparent [font-family:ui-sans-serif,system-ui,sans-serif] text-[15px] leading-[1.94] tracking-[0.002em] !text-inherit md:text-[16px] md:leading-[2] [&_.highlight]:!bg-transparent [&_blockquote]:rounded-2xl [&_blockquote]:border-0 [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote_p]:!my-0 [&_code]:rounded-md [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.92em] [&_h3]:mt-0 [&_h3]:mb-4 [&_h3]:font-serif [&_h3]:text-[1.85rem] [&_h3]:leading-[1.22] [&_h3]:tracking-[-0.024em] [&_h4]:mt-8 [&_h4]:mb-3 [&_h4]:text-[1.04rem] [&_h4]:font-semibold [&_h4]:tracking-[-0.01em] [&_hr]:my-8 [&_li]:my-3.5 [&_ol]:my-5 [&_ol]:pl-6 [&_p]:my-5 [&_pre]:rounded-2xl [&_pre]:border [&_pre]:p-4 [&_strong]:font-semibold [&_strong]:tracking-[0.003em] [&_ul]:my-5 [&_ul]:pl-6"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
