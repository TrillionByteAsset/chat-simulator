import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getChatSimulatorFaqStructuredData } from '@/tools/chat-simulator/faq-structured-data';
import { getDefaultToolManifest } from '@/tools/shared/default-tool-manifest';
import { ToolSitePage } from '@/tools/shared/tool-site-page';
import { getToolSitePageMetadata } from '@/tools/shared/tool-site-page-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const manifest = await getDefaultToolManifest();

  if (!manifest) {
    return { title: 'Page Not Found' };
  }

  return getToolSitePageMetadata({
    kind: 'faq',
    locale,
    manifest,
    canonicalPath: '/faq',
  });
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const manifest = await getDefaultToolManifest();

  if (!manifest) {
    notFound();
  }

  const faqStructuredData =
    manifest.name === 'Chat Simulator'
      ? getChatSimulatorFaqStructuredData({
          canonicalPath: '/faq',
          locale,
          manifest,
        })
      : null;

  return (
    <>
      {faqStructuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqStructuredData),
          }}
        />
      ) : null}
      <ToolSitePage kind="faq" locale={locale} manifest={manifest} />
    </>
  );
}
