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

Allowed public pages:
- ${envConfigs.app_url}/
- ${envConfigs.app_url}/blog
- ${envConfigs.app_url}/tools/${toolName}

Restricted pages:
- ${envConfigs.app_url}/studio
- ${envConfigs.app_url}/studio/*
- ${envConfigs.app_url}/admin/*
- ${envConfigs.app_url}/api/*
- ${envConfigs.app_url}/settings/*
- ${envConfigs.app_url}/activity/*

Policy:
- Do not crawl, summarize, or expose restricted pages.
- Respect ${envConfigs.app_url}/robots.txt as the canonical crawl policy.
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
