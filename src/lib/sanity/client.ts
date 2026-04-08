import { createClient, type QueryParams } from 'next-sanity';

export const sanityEnv = {
  apiVersion: '2026-04-07',
  dataset:
    process.env.NEXT_PUBLIC_SANITY_DATASET ??
    process.env.SANITY_DATASET ??
    'production',
  projectId:
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??
    process.env.SANITY_PROJECT_ID ??
    '',
  token: process.env.SANITY_API_TOKEN ?? '',
  studioUrl: '/studio',
} as const;

export function isSanityConfigured() {
  return Boolean(sanityEnv.projectId && sanityEnv.dataset);
}

function createConfiguredClient(options?: {
  perspective?: 'published' | 'drafts';
  token?: string;
  useCdn?: boolean;
}) {
  if (!isSanityConfigured()) {
    return null;
  }

  return createClient({
    apiVersion: sanityEnv.apiVersion,
    dataset: sanityEnv.dataset,
    projectId: sanityEnv.projectId,
    perspective: options?.perspective ?? 'published',
    token: options?.token,
    useCdn: options?.useCdn ?? true,
  });
}

export const sanityPublishedLiveClient = createConfiguredClient({
  perspective: 'published',
  useCdn: false,
});

export const sanityPublishedCdnClient = createConfiguredClient({
  perspective: 'published',
  useCdn: true,
});

export const sanityPreviewClient = createConfiguredClient({
  perspective: 'drafts',
  token: sanityEnv.token || undefined,
  useCdn: false,
});

type SanityFetchOptions = {
  params?: QueryParams;
  perspective?: 'published' | 'drafts';
  query: string;
  revalidate?: number | false;
  source?: 'cdn' | 'live';
  tags?: string[];
};

export async function sanityFetch<T>({
  params = {},
  perspective = 'published',
  query,
  revalidate = 3600,
  source = 'cdn',
  tags = [],
}: SanityFetchOptions): Promise<T> {
  const client =
    perspective === 'drafts'
      ? sanityPreviewClient
      : source === 'live'
        ? sanityPublishedLiveClient
        : sanityPublishedCdnClient;

  if (!client) {
    throw new Error(
      'Sanity is not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.'
    );
  }

  return client.fetch<T>(query, params, {
    next: {
      revalidate,
      tags,
    },
  });
}
