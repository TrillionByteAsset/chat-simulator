import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getDefaultToolName } from '@/tools/shared/default-tool-manifest';

import { defaultLocale } from '@/config/locale';

export function generateMetadata(): Metadata {
  return { robots: { index: false, follow: true } };
}

export default async function LegacyToolPage({
  params,
}: {
  params: Promise<{ locale: string; toolName: string }>;
}) {
  const { locale, toolName } = await params;

  if (toolName !== getDefaultToolName()) {
    notFound();
  }

  permanentRedirect(locale === defaultLocale ? '/' : `/${locale}`);
}
