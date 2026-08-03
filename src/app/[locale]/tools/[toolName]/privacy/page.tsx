import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getDefaultToolName } from '@/tools/shared/default-tool-manifest';

import { buildLocalizedPath } from '@/shared/lib/seo';

export function generateMetadata(): Metadata {
  return { robots: { index: false, follow: true } };
}

export default async function LegacyToolPrivacyPage({
  params,
}: {
  params: Promise<{ locale: string; toolName: string }>;
}) {
  const { locale, toolName } = await params;

  if (toolName !== getDefaultToolName()) {
    notFound();
  }

  permanentRedirect(buildLocalizedPath('/privacy', locale));
}
