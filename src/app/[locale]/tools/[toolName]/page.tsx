import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocalizedToolManifest } from '@/tools/shared/localized-tool-manifest';

import DynamicLoader, {
  getToolManifest,
} from '@/core/tooling-engine/DynamicLoader';
import { generateToolMetadata } from '@/core/tooling-engine/metadata';
import ChatSimulatorTool from '@/tools/chat-simulator/index';
import { OtherTools } from '@/themes/tools/blocks/other-tools';
import { ToolCaseShowcase } from '@/themes/tools/blocks/tool-case-showcase';
import { ToolIntro } from '@/themes/tools/blocks/tool-intro';
import { ToolStage } from '@/themes/tools/blocks/tool-stage';

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

  const pageHeading = manifest.seo?.h1 || manifest.name;
  const pageDescription = manifest.seo?.description || '';
  const activeSkin = manifest.config?.skin_preset || 'default';
  const toolScopeClassName = `tool-root-${toolName} ds-tool-wrapper`;
  const toolSkinClassName = `skin-theme-${activeSkin}`;

  return (
    <>
      {/* UE Section 2: 工具功能区（运行工具的区域） */}
      <ToolStage heading={pageHeading} description={pageDescription}>
        {toolName === 'chat-simulator' ? (
          <div
            className={`${toolScopeClassName} ${toolSkinClassName} flex h-full w-full flex-col`}
          >
            <ChatSimulatorTool
              manifest={manifest}
              structuredDataPath={`/tools/${toolName}`}
              themeName="default"
            />
          </div>
        ) : (
          <DynamicLoader toolName={toolName} themeName="default" />
        )}
      </ToolStage>

      <ToolCaseShowcase toolName={toolName} />

      {/* UE Section 3: 工具功能介绍（图文） */}
      <ToolIntro toolName={toolName} />

      {/* UE Section 4: 其他工具（3列卡片网格） */}
      <OtherTools />
    </>
  );
}
