import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocalizedToolManifest } from '@/tools/shared/localized-tool-manifest';

import { getThemeBlock } from '@/core/theme';
import DynamicLoader, {
  getToolManifest,
} from '@/core/tooling-engine/DynamicLoader';
import { generateToolMetadata } from '@/core/tooling-engine/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; toolName: string }>;
}): Promise<Metadata> {
  const { locale, toolName } = await params;
  const manifest = getLocalizedToolManifest(
    await getToolManifest(toolName),
    locale
  );

  if (!manifest) {
    return { title: 'Tool Not Found' };
  }

  return generateToolMetadata(manifest, {
    canonicalPath: `/tools/${toolName}`,
    locale,
  });
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ locale: string; toolName: string }>;
}) {
  const { locale, toolName } = await params;
  const manifest = getLocalizedToolManifest(
    await getToolManifest(toolName),
    locale
  );

  if (!manifest) {
    notFound();
  }

  // 加载 UE 线框中的各功能区块
  const ToolStage = await getThemeBlock('tool-stage');
  const ToolCaseShowcase = await getThemeBlock('tool-case-showcase');
  const ToolIntro = await getThemeBlock('tool-intro');
  const OtherTools = await getThemeBlock('other-tools');
  const pageHeading = manifest.seo?.h1 || manifest.name;
  const pageDescription = manifest.seo?.description || '';

  return (
    <>
      {/* UE Section 2: 工具功能区（运行工具的区域） */}
      <ToolStage heading={pageHeading} description={pageDescription}>
        <DynamicLoader toolName={toolName} themeName="default" />
      </ToolStage>

      <ToolCaseShowcase toolName={toolName} />

      {/* UE Section 3: 工具功能介绍（图文） */}
      <ToolIntro toolName={toolName} />

      {/* UE Section 4: 其他工具（3列卡片网格） */}
      <OtherTools />
    </>
  );
}
