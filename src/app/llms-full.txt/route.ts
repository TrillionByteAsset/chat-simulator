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
  const usageSummary = manifest?.usage?.description || '';
  const content = `# ${siteTitle} - Full LLM Summary

Site URL: ${envConfigs.app_url}
Primary tool URL: ${envConfigs.app_url}/tools/${toolName}

Summary:
${summary}

Tool purpose:
${usageSummary || 'This website provides a browser-based tool experience with supporting policy and informational pages.'}

Important public pages:
- ${envConfigs.app_url}/tools/${toolName}
- ${envConfigs.app_url}/tools/${toolName}/about
- ${envConfigs.app_url}/tools/${toolName}/faq
- ${envConfigs.app_url}/tools/${toolName}/privacy
- ${envConfigs.app_url}/tools/${toolName}/terms
- ${envConfigs.app_url}/about
- ${envConfigs.app_url}/faq
- ${envConfigs.app_url}/privacy
- ${envConfigs.app_url}/terms

Privacy and policy notes:
- Tool content is designed to be handled locally whenever possible.
- The site may use cookies, analytics, and advertising services such as Google AdSense.
- Contact email: info@chat-simulator.top

Crawl and discovery:
- robots: ${envConfigs.app_url}/robots.txt
- sitemap: ${envConfigs.app_url}/sitemap.xml

Best page to understand the product:
- ${envConfigs.app_url}/tools/${toolName}
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
