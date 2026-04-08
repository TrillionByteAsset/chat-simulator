import imageUrlBuilder, { type SanityImageSource } from '@sanity/image-url';

import { isSanityConfigured, sanityEnv } from './client';

const builder = isSanityConfigured()
  ? imageUrlBuilder({
      dataset: sanityEnv.dataset,
      projectId: sanityEnv.projectId,
    })
  : null;

export function urlForImage(source: SanityImageSource) {
  if (!builder) {
    throw new Error(
      'Sanity image builder is unavailable because the project is not configured.'
    );
  }

  return builder.image(source);
}
