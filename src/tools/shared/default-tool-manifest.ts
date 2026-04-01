import { getToolManifest } from '@/core/tooling-engine/DynamicLoader';
import { envConfigs } from '@/config';

export function getDefaultToolName() {
  return envConfigs.default_tool || 'chat-simulator';
}

export async function getDefaultToolManifest() {
  return getToolManifest(getDefaultToolName());
}
