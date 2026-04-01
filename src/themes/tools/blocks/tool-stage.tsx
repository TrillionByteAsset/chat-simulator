'use client';

import React from 'react';

export function ToolStage({
  heading,
  description,
  children,
}: {
  heading?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="container pt-5 pb-4 md:pt-6 md:pb-4">
      {heading ? (
        <div className="mb-5 flex min-w-0 items-center justify-between gap-4">
          <div className="min-w-0">
            <h1
              className="truncate text-left text-xl font-semibold tracking-tight sm:text-2xl"
              title={heading}
            >
              {heading}
            </h1>
            {description ? <p className="sr-only">{description}</p> : null}
          </div>
        </div>
      ) : null}
      <div className="mx-auto w-full">{children}</div>
    </section>
  );
}
