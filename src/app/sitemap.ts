import type { MetadataRoute } from 'next';
import { getBlogSitemapEntries } from '@/lib/sanity/blog';

import { locales } from '@/config/locale';
import { buildLocalizedUrl, getLanguageAlternates } from '@/shared/lib/seo';

const staticPages = [
  { path: '/', changeFrequency: 'weekly' as const, priority: 1 },
  { path: '/about', changeFrequency: 'yearly' as const, priority: 0.7 },
  { path: '/faq', changeFrequency: 'monthly' as const, priority: 0.85 },
  { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.7 },
  { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) => {
    const languages = getLanguageAlternates({
      en: page.path,
      zh: page.path,
    });

    return locales.map((locale) => ({
      url: buildLocalizedUrl(page.path, locale),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: { languages },
    }));
  });

  const { categories, posts } = await getBlogSitemapEntries();
  const blogEntries: MetadataRoute.Sitemap = [];
  const blogLanguages = getLanguageAlternates({
    en: '/blog',
    zh: '/blog',
  });

  locales.forEach((locale) => {
    blogEntries.push({
      url: buildLocalizedUrl('/blog', locale),
      changeFrequency: 'daily',
      priority: 0.8,
      alternates: { languages: blogLanguages },
    });
  });

  categories.forEach((category) => {
    const paths = {
      en: category.slugEn ? `/blog/category/${category.slugEn}` : undefined,
      zh: category.slugZh ? `/blog/category/${category.slugZh}` : undefined,
    };
    const languages = getLanguageAlternates(paths);

    Object.entries(paths).forEach(([locale, path]) => {
      if (!path) return;

      blogEntries.push({
        url: buildLocalizedUrl(path, locale),
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: { languages },
        ...(category._updatedAt
          ? { lastModified: new Date(category._updatedAt) }
          : {}),
      });
    });
  });

  posts.forEach((post) => {
    const paths = {
      en: post.slugEn ? `/blog/${post.slugEn}` : undefined,
      zh: post.slugZh ? `/blog/${post.slugZh}` : undefined,
    };
    const languages = getLanguageAlternates(paths);
    const lastModified = post._updatedAt || post.publishedAt;

    Object.entries(paths).forEach(([locale, path]) => {
      if (!path) return;

      blogEntries.push({
        url: buildLocalizedUrl(path, locale),
        changeFrequency: 'monthly',
        priority: 0.75,
        alternates: { languages },
        ...(lastModified ? { lastModified: new Date(lastModified) } : {}),
      });
    });
  });

  return [...staticEntries, ...blogEntries];
}
