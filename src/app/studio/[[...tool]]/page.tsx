'use client';

import { NextStudio } from 'next-sanity/studio';

import config from '../../../../sanity.config';
import { isSanityConfigured } from '@/lib/sanity/client';

export default function StudioPage() {
  if (!isSanityConfigured()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <h1 className="mb-4 text-3xl font-semibold">Sanity is not configured</h1>
        <p className="text-muted-foreground mb-6">
          Add the Sanity environment variables before opening the embedded
          Studio.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>
            <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code>
          </li>
          <li>
            <code>NEXT_PUBLIC_SANITY_DATASET</code>
          </li>
          <li>
            <code>SANITY_API_TOKEN</code>
          </li>
        </ul>
      </main>
    );
  }

  return <NextStudio config={config} />;
}
