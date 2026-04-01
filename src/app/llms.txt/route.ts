import { NextResponse } from 'next/server';
import {
  getDefaultToolManifest,
  getDefaultToolName,
} from '@/tools/shared/default-tool-manifest';

import { envConfigs } from '@/config';

export async function GET() {
  const manifest = await getDefaultToolManifest();
  const toolName = getDefaultToolName();
  const siteTitle = manifest?.name || envConfigs.app_name;
  const summary = manifest?.seo?.description || envConfigs.app_description;
  const content = `# ${siteTitle}

> ${summary}

This website is an independently maintained tool site focused on practical browser-based utilities.

Primary pages:
- ${envConfigs.app_url}/tools/${toolName}
- ${envConfigs.app_url}/about
- ${envConfigs.app_url}/faq
- ${envConfigs.app_url}/privacy
- ${envConfigs.app_url}/terms

Machine-readable resources:
- ${envConfigs.app_url}/robots.txt
- ${envConfigs.app_url}/sitemap.xml
- ${envConfigs.app_url}/llms-full.txt

Contact:
- ${envConfigs.app_url}
- mailto:info@chat-simulator.top
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
