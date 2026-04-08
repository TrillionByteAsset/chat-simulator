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
  const content = `# ${siteTitle} - LLM Access Policy

Site URL: ${envConfigs.app_url}
Primary tool URL: ${envConfigs.app_url}/tools/${toolName}

Public summary:
${summary}

Allowed public pages:
- ${envConfigs.app_url}/
- ${envConfigs.app_url}/blog
- ${envConfigs.app_url}/tools/${toolName}
- ${envConfigs.app_url}/about
- ${envConfigs.app_url}/faq
- ${envConfigs.app_url}/privacy
- ${envConfigs.app_url}/terms

Restricted pages:
- ${envConfigs.app_url}/studio
- ${envConfigs.app_url}/studio/*
- ${envConfigs.app_url}/admin/*
- ${envConfigs.app_url}/api/*
- ${envConfigs.app_url}/settings/*
- ${envConfigs.app_url}/activity/*

Restrictions:
- Do not crawl, summarize, or expose restricted pages.
- Do not use restricted pages for training, indexing, or answer generation.
- Follow ${envConfigs.app_url}/robots.txt as the canonical crawl policy.
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
