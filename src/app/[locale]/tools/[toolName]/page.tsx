import { Metadata } from 'next';
import { generateToolMetadata } from '@/core/tooling-engine/metadata';
import DynamicLoader, { getToolManifest } from '@/core/tooling-engine/DynamicLoader';
import { getThemeBlock } from '@/core/theme';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ toolName: string }>;
}): Promise<Metadata> {
  const { toolName } = await params;
  const manifest = await getToolManifest(toolName);
  
  if (!manifest) {
    return { title: 'Tool Not Found' };
  }
  
  return generateToolMetadata(manifest);
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ toolName: string }>;
}) {
  const { toolName } = await params;
  const manifest = await getToolManifest(toolName);

  if (!manifest) {
    notFound();
  }

  // 加载 UE 线框中的各功能区块
  const ToolStage = await getThemeBlock('tool-stage');
  const ToolIntro = await getThemeBlock('tool-intro');
  const OtherTools = await getThemeBlock('other-tools');

  return (
    <>
      {/* UE Section 2: 工具功能区（运行工具的区域） */}
      <ToolStage>
        <DynamicLoader toolName={toolName} themeName="default" />
      </ToolStage>

      {/* UE Section 3: 工具功能介绍（图文） */}
      <ToolIntro toolName={toolName} />

      {/* UE Section 4: 其他工具（3列卡片网格） */}
      <OtherTools />
    </>
  );
}
