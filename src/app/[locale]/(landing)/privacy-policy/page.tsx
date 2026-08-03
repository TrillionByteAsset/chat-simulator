import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';

import { buildLocalizedPath } from '@/shared/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return { robots: { index: false, follow: true } };
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  permanentRedirect(buildLocalizedPath('/privacy', locale));
}
