// src/core/tooling-engine/DynamicLoader.tsx
import React, { Suspense } from 'react';
import fs from 'fs';
import path from 'path';
import { ToolManifest } from './types';

/**
 * 使用 fs 读取 manifest.json（仅服务端）
 * 避免 Turbopack 对动态 import() JSON 的兼容性问题
 */
export async function getToolManifest(toolName: string): Promise<ToolManifest | null> {
  try {
    const manifestPath = path.join(process.cwd(), 'src', 'tools', toolName, 'manifest.json');
    const raw = fs.readFileSync(manifestPath, 'utf-8');
    return JSON.parse(raw) as ToolManifest;
  } catch (error) {
    console.error(`[ToolingEngine] Failed to load manifest for tool: ${toolName}`, error);
    return null;
  }
}

interface DynamicLoaderProps {
  toolName: string;
  themeName?: string;
  fallback?: React.ReactNode;
}

/**
 * DynamicLoader: 多态动态渲染引擎
 * 根据 manifest.json 的 type 字段自动适配渲染模式
 * 
 * 已知限制：Turbopack 需要能静态分析 import() 路径。
 * 因此这里使用一个工具注册表来映射工具名到组件。
 */

// 工具注册表 —— 在这里注册所有可用的工具
// 这是 Turbopack 兼容的方式（静态 import 路径）
const TOOL_REGISTRY: Record<string, () => Promise<any>> = {
  'chat-simulator': () => import('../../tools/chat-simulator/index'),
  'example-tool': () => import('../../tools/example-tool/index'),
};

export default async function DynamicLoader({ toolName, themeName, fallback }: DynamicLoaderProps) {
  const manifest = await getToolManifest(toolName);
  
  if (!manifest) {
    return (
      <div className="p-4 border border-red-500 rounded-md bg-red-50 text-red-700">
        <h3>Tool Load Error</h3>
        <p>Tool &quot;{toolName}&quot; not found or missing manifest.json.</p>
      </div>
    );
  }

  try {
    // 从注册表获取工具加载器
    const loader = TOOL_REGISTRY[toolName];
    if (!loader) {
      throw new Error(`Tool "${toolName}" is not registered in TOOL_REGISTRY. Please add it to DynamicLoader.tsx.`);
    }

    const ToolModule = await loader();
    const ToolComponent = ToolModule.default;
    
    // Retrieve the active skin from manifest
    const activeSkin = manifest.config?.skin_preset || 'default';
    const skinClassName = `skin-theme-${activeSkin}`;
    const scopeClassName = `tool-root-${toolName} ds-tool-wrapper`;

    return (
      <div className={`${scopeClassName} ${skinClassName} w-full h-full flex flex-col`}>
        <Suspense fallback={fallback || <div className="p-4">Loading tool component...</div>}>
          <ToolComponent manifest={manifest} themeName={themeName} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error(`[ToolingEngine] Failed to load tool component: ${toolName}`, error);
    return (
      <div className="p-4 border border-red-500 rounded-md bg-red-50 text-red-700">
        <h3>Tool Render Error</h3>
        <p>Failed to render tool &quot;{toolName}&quot;. {String(error)}</p>
      </div>
    );
  }
}
