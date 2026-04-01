import { getChatSimulatorLocalizedManifest } from '@/tools/chat-simulator/localization';

import type { ToolManifest } from '@/core/tooling-engine/types';

export function getLocalizedToolManifest(
  manifest: ToolManifest | null,
  locale?: string
) {
  if (!manifest) {
    return null;
  }

  if (manifest.name === 'Chat Simulator') {
    return getChatSimulatorLocalizedManifest(manifest, locale);
  }

  return manifest;
}
