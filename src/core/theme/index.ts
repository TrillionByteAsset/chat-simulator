import { envConfigs } from '@/config';
import { defaultTheme } from '@/config/theme';

type ThemeLoader = () => Promise<any>;
type ThemeRegistry = Record<string, Record<string, ThemeLoader>>;

const pageRegistry: ThemeRegistry = {
  default: {
    'dynamic-page': () => import('@/themes/default/pages/dynamic-page'),
    'static-page': () => import('@/themes/default/pages/static-page'),
  },
  tools: {
    'dynamic-page': () => import('@/themes/tools/pages/dynamic-page'),
  },
};

const layoutRegistry: ThemeRegistry = {
  default: {
    landing: () => import('@/themes/default/layouts/landing'),
    tool: () => import('@/themes/default/layouts/tool'),
  },
  tools: {
    landing: () => import('@/themes/tools/layouts/landing'),
    tool: () => import('@/themes/tools/layouts/tool'),
  },
};

const blockRegistry: ThemeRegistry = {
  default: {
    blog: () => import('@/themes/default/blocks/blog'),
    'blog-detail': () => import('@/themes/default/blocks/blog-detail'),
    cta: () => import('@/themes/default/blocks/cta'),
    faq: () => import('@/themes/default/blocks/faq'),
    features: () => import('@/themes/default/blocks/features'),
    'features-accordion': () =>
      import('@/themes/default/blocks/features-accordion'),
    'features-flow': () => import('@/themes/default/blocks/features-flow'),
    'features-list': () => import('@/themes/default/blocks/features-list'),
    'features-media': () => import('@/themes/default/blocks/features-media'),
    'features-step': () => import('@/themes/default/blocks/features-step'),
    footer: () => import('@/themes/default/blocks/footer'),
    header: () => import('@/themes/default/blocks/header'),
    hero: () => import('@/themes/default/blocks/hero'),
    logos: () => import('@/themes/default/blocks/logos'),
    'other-tools': () => import('@/themes/default/blocks/other-tools'),
    'page-detail': () => import('@/themes/default/blocks/page-detail'),
    pricing: () => import('@/themes/default/blocks/pricing'),
    showcases: () => import('@/themes/default/blocks/showcases'),
    'showcases-flow': () => import('@/themes/default/blocks/showcases-flow'),
    'social-avatars': () =>
      import('@/themes/default/blocks/social-avatars'),
    stats: () => import('@/themes/default/blocks/stats'),
    subscribe: () => import('@/themes/default/blocks/subscribe'),
    testimonials: () => import('@/themes/default/blocks/testimonials'),
    'tool-intro': () => import('@/themes/default/blocks/tool-intro'),
    'tool-stage': () => import('@/themes/default/blocks/tool-stage'),
    updates: () => import('@/themes/default/blocks/updates'),
  },
  tools: {
    'other-tools': () => import('@/themes/tools/blocks/other-tools'),
    'tool-case-showcase': () =>
      import('@/themes/tools/blocks/tool-case-showcase'),
    'tool-footer': () => import('@/themes/tools/blocks/tool-footer'),
    'tool-header': () => import('@/themes/tools/blocks/tool-header'),
    'tool-intro': () => import('@/themes/tools/blocks/tool-intro'),
    'tool-stage': () => import('@/themes/tools/blocks/tool-stage'),
    'tools-grid': () => import('@/themes/tools/blocks/tools-grid'),
    'tools-hero': () => import('@/themes/tools/blocks/tools-hero'),
  },
};

async function loadThemeModule(
  registry: ThemeRegistry,
  typeLabel: string,
  name: string,
  theme?: string
) {
  const loadTheme = theme || getActiveTheme();
  const themedLoader = registry[loadTheme]?.[name];

  if (themedLoader) {
    return themedLoader();
  }

  if (loadTheme !== defaultTheme) {
    const fallbackLoader = registry[defaultTheme]?.[name];
    if (fallbackLoader) {
      return fallbackLoader();
    }
  }

  throw new Error(`Unknown theme ${typeLabel}: "${name}" for theme "${loadTheme}"`);
}

/**
 * get active theme
 */
export function getActiveTheme(): string {
  const theme = envConfigs.theme as string;

  if (theme) {
    return theme;
  }

  return defaultTheme;
}

/**
 * load theme page
 */
export async function getThemePage(pageName: string, theme?: string) {
  const module = await loadThemeModule(pageRegistry, 'page', pageName, theme);
  return module.default;
}

/**
 * load theme layout
 */
export async function getThemeLayout(layoutName: string, theme?: string) {
  const module = await loadThemeModule(
    layoutRegistry,
    'layout',
    layoutName,
    theme
  );
  return module.default;
}

/**
 * convert kebab-case to PascalCase
 */
function kebabToPascalCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * load theme block
 */
export async function getThemeBlock(blockName: string, theme?: string) {
  const pascalCaseName = kebabToPascalCase(blockName);
  const module = await loadThemeModule(blockRegistry, 'block', blockName, theme);
  const component = module[pascalCaseName] || module[blockName];

  if (!component) {
    throw new Error(`No valid export found in block "${blockName}"`);
  }

  return component;
}
