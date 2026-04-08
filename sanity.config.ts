import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

import { schemaTypes } from './schemas';
import { sanityEnv } from './src/lib/sanity/client';

export default defineConfig({
  basePath: '/studio',
  name: 'default',
  title: `${process.env.NEXT_PUBLIC_APP_NAME || 'Website'} Content Studio`,
  projectId: sanityEnv.projectId || 'missing-project-id',
  dataset: sanityEnv.dataset || 'production',
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
