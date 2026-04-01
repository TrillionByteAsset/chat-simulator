'use client';

import {
  CHAT_SIMULATOR_APPLY_TEMPLATE_EVENT,
  getChatSimulatorCaseTemplates,
} from '@/tools/chat-simulator/data/caseTemplates';
import { useLocale } from 'next-intl';

export function ToolCaseShowcase({ toolName }: { toolName?: string }) {
  const locale = useLocale();
  const isZh = locale.toLowerCase().startsWith('zh');

  if (toolName !== 'chat-simulator') {
    return null;
  }

  const templates = getChatSimulatorCaseTemplates(locale);

  const handleApplyCase = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent(CHAT_SIMULATOR_APPLY_TEMPLATE_EVENT, {
        detail: template,
      })
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <section className="container py-4 md:py-6">
      <div className="border-foreground/10 bg-card/90 rounded-[28px] border p-7 shadow-[0_24px_70px_-38px_rgba(0,0,0,0.45)] backdrop-blur md:p-10">
        <div className="max-w-none lg:max-w-[72rem]">
          <p className="text-primary/75 text-[0.76rem] font-semibold tracking-[0.14em] uppercase">
            {isZh ? '有趣案例' : 'Fun Cases'}
          </p>
          <h2 className="text-foreground mt-3 font-serif text-[2rem] leading-[1.14] tracking-[-0.025em] md:text-[2.55rem]">
            {isZh
              ? '点一个搞笑又好玩的案例，直接放到上方开改'
              : 'Pick a funny, playful case and drop it into the editor'}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-none text-[15px] leading-[1.92] md:text-[16px] md:leading-[1.98]">
            {isZh
              ? '这里放的是偏搞笑、偏有梗、适合直接拿来二创的聊天案例。点任意一张卡片，内容就会直接套用到上方功能区，你可以继续改人物、头像、时间、背景和消息。'
              : 'These are funny, scroll-stopping chat setups made for remixing. Click any card to load it into the editor above, then tweak the people, avatars, timing, backgrounds, and messages however you like.'}
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleApplyCase(template.id)}
              className="group h-full text-left"
            >
              <div className="border-foreground/10 bg-background group-hover:border-foreground/18 relative flex h-full min-h-[350px] flex-col overflow-hidden rounded-[28px] border p-5 shadow-[0_18px_50px_-34px_rgba(0,0,0,0.42)] transition duration-200 group-hover:-translate-y-1">
                <div className="pointer-events-none absolute inset-x-5 top-0 h-20 rounded-b-[24px] bg-gradient-to-b from-white/12 to-transparent" />
                <div
                  className={`rounded-[22px] bg-gradient-to-br ${template.accent} border border-white/40 p-4`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="bg-background/80 text-foreground rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase">
                      {template.platform}
                    </span>
                    <span className="text-muted-foreground text-xs font-medium">
                      {isZh ? '点击套用到上方' : 'Apply to editor'}
                    </span>
                  </div>

                  <h3 className="text-foreground mt-4 text-[1.36rem] font-semibold tracking-[-0.02em]">
                    {template.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {template.subtitle}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {template.preview.map((item) => (
                      <span
                        key={item}
                        className="bg-background/76 text-foreground rounded-full px-3 py-1.5 text-xs font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-muted-foreground mt-4 text-[14px] leading-7">
                  {template.description}
                </p>

                <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {template.channel.name}
                    </p>
                    <p className="text-muted-foreground mt-1 max-w-[24rem] text-xs leading-5">
                      {template.channel.description}
                    </p>
                  </div>
                  <span className="text-primary shrink-0 text-sm font-semibold">
                    {isZh ? '立即放上去' : 'Use now'}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
