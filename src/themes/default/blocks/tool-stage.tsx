'use client';

import React from 'react';

/**
 * ToolStage Block: UE 线框中的"工具功能区（运行工具的区域）"
 * 这是工具的主渲染区域，由 DynamicLoader 将工具组件注入到此插槽中
 */
export function ToolStage({
  section,
  children,
}: {
  section?: any;
  children: React.ReactNode;
}) {
  return (
    <section className="container py-8 md:py-12">
      <div className="mx-auto w-full overflow-hidden rounded-xl border border-foreground/10 bg-card shadow-lg shadow-black/5">
        <div className="min-h-[480px] md:min-h-[600px]">
          {children}
        </div>
      </div>
    </section>
  );
}
