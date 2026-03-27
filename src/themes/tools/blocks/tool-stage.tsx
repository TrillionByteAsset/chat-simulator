'use client';

import React from 'react';

export function ToolStage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="container py-8 md:py-12">
      <div className="mx-auto w-full overflow-hidden rounded-xl border border-foreground/10 bg-card shadow-lg shadow-black/5">
        <div className="min-h-[480px] md:min-h-[600px]">{children}</div>
      </div>
    </section>
  );
}
