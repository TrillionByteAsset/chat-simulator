import { revalidatePath, revalidateTag } from 'next/cache';

import { respData, respErr } from '@/shared/lib/resp';
import { buildLocalizedPath } from '@/shared/lib/seo';

type SanityWebhookBody = {
  slug?: {
    current?: string;
    en?: {
      current?: string;
    };
    zh?: {
      current?: string;
    };
  };
  slugs?: {
    en?: string;
    zh?: string;
  };
  type?: string;
};

function getWebhookSecret(request: Request) {
  return request.headers.get('x-webhook-secret');
}

function getPathsFromPayload(body: SanityWebhookBody) {
  const slugEn = body?.slugs?.en || body?.slug?.en?.current;
  const slugZh = body?.slugs?.zh || body?.slug?.zh?.current || body?.slug?.current;

  return {
    categoryPaths:
      body?.type === 'category'
        ? [
            slugZh ? buildLocalizedPath(`/blog/category/${slugZh}`, 'zh') : null,
            slugEn ? buildLocalizedPath(`/blog/category/${slugEn}`, 'en') : null,
          ].filter(Boolean) as string[]
        : [],
    postPaths:
      body?.type === 'post'
        ? [
            slugZh ? buildLocalizedPath(`/blog/${slugZh}`, 'zh') : null,
            slugEn ? buildLocalizedPath(`/blog/${slugEn}`, 'en') : null,
          ].filter(Boolean) as string[]
        : [],
  };
}

export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    return respErr('SANITY_REVALIDATE_SECRET is not configured');
  }

  const providedSecret = getWebhookSecret(request);
  if (providedSecret !== secret) {
    return respErr('invalid revalidation secret');
  }

  const body = ((await request.json().catch(() => ({}))) ||
    {}) as SanityWebhookBody;
  const { categoryPaths, postPaths } = getPathsFromPayload(body);

  // Route Handlers can't use updateTag(), so we set expire: 0 to avoid serving
  // one more stale response after publish/delete webhooks.
  revalidateTag('blog:posts', { expire: 0 });
  revalidateTag('blog:categories', { expire: 0 });
  revalidateTag('blog:sitemap', { expire: 0 });

  revalidatePath(buildLocalizedPath('/blog', 'zh'));
  revalidatePath(buildLocalizedPath('/blog', 'en'));
  revalidatePath('/sitemap.xml');

  categoryPaths.forEach((path) => revalidatePath(path));
  postPaths.forEach((path) => revalidatePath(path));

  return respData({
    categoryPaths,
    ok: true,
    postPaths,
    revalidated: ['blog:posts', 'blog:categories', 'blog:sitemap'],
  });
}
