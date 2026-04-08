import type { Category, Post } from '@/shared/types/blocks/blog';

import { sanityFetch, isSanityConfigured } from './client';
import {
  categoryBySlugQuery,
  categoryListQuery,
  postBySlugQuery,
  postListQuery,
  postsByCategorySlugQuery,
  sitemapCategoriesQuery,
  sitemapPostsQuery,
  type SanityLocale,
} from './queries';
import { urlForImage } from './image';
import { SanityPortableText, getPortableTextToc } from './portable-text';

type SanityImageLike = {
  asset?: {
    _ref?: string;
  };
};

type SanityAuthor = {
  bio?: string;
  image?: SanityImageLike;
  name?: string;
};

type SanityCategory = {
  _id: string;
  description?: string;
  slugEn?: string;
  slugZh?: string;
  slug?: string;
  title?: string;
};

type SanityPostSummary = {
  _id: string;
  _updatedAt?: string;
  author?: SanityAuthor;
  categories?: SanityCategory[];
  coverImage?: SanityImageLike;
  excerpt?: string;
  publishedAt?: string;
  slug?: string;
  title?: string;
};

type SanityPostDetail = SanityPostSummary & {
  body?: any[];
  coverImageAlt?: string;
  noindex?: boolean;
  seoDescription?: string;
  seoTitle?: string;
  slugEn?: string;
  slugZh?: string;
  updatedAt?: string;
};

type SanitySitemapPost = {
  _id: string;
  _updatedAt?: string;
  publishedAt?: string;
  slugEn?: string;
  slugZh?: string;
};

type SanitySitemapCategory = {
  _id: string;
  _updatedAt?: string;
  slugEn?: string;
  slugZh?: string;
};

function formatDate(dateString?: string) {
  if (!dateString) return undefined;

  try {
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

function getImageUrl(image?: SanityImageLike, width = 1200) {
  if (!image?.asset?._ref || !isSanityConfigured()) {
    return undefined;
  }

  return urlForImage(image).width(width).fit('max').auto('format').url();
}

function mapCategory(category: SanityCategory): Category {
  return {
    description: category.description,
    id: category._id,
    slug: category.slug,
    slug_en: category.slugEn,
    slug_zh: category.slugZh,
    title: category.title,
    url: category.slug ? `/blog/category/${category.slug}` : '/blog',
  };
}

function mapPostSummary(post: SanityPostSummary): Post {
  return {
    author_image: getImageUrl(post.author?.image, 96),
    author_name: post.author?.name,
    categories: post.categories?.map(mapCategory) || [],
    created_at: formatDate(post.publishedAt),
    description: post.excerpt,
    id: post._id,
    image: getImageUrl(post.coverImage, 1200),
    slug: post.slug,
    title: post.title,
    url: post.slug ? `/blog/${post.slug}` : '/blog',
  };
}

export async function getBlogListing(locale: SanityLocale) {
  if (!isSanityConfigured()) {
    return {
      categories: [] as Category[],
      posts: [] as Post[],
    };
  }

  const [categories, posts] = await Promise.all([
    sanityFetch<SanityCategory[]>({
      query: categoryListQuery(locale),
      // Blog landing pages should reflect webhook-driven publish/delete changes
      // immediately after revalidation, so we bypass Sanity's API CDN and rely on
      // Next.js/Vercel caching instead.
      source: 'live',
      tags: ['blog:categories'],
    }),
    sanityFetch<SanityPostSummary[]>({
      query: postListQuery(locale),
      source: 'live',
      tags: ['blog:posts'],
    }),
  ]);

  return {
    categories: categories.map(mapCategory),
    posts: posts.map(mapPostSummary),
  };
}

export async function getCategoryListing(locale: SanityLocale, slug: string) {
  if (!isSanityConfigured()) {
    return null;
  }

  const [categories, currentCategory, posts] = await Promise.all([
    sanityFetch<SanityCategory[]>({
      query: categoryListQuery(locale),
      source: 'live',
      tags: ['blog:categories'],
    }),
    sanityFetch<SanityCategory | null>({
      query: categoryBySlugQuery(locale),
      params: { slug },
      source: 'live',
      tags: [`blog:category:${slug}`],
    }),
    sanityFetch<SanityPostSummary[]>({
      query: postsByCategorySlugQuery(locale),
      params: { slug },
      source: 'live',
      tags: ['blog:posts', `blog:category:${slug}`],
    }),
  ]);

  if (!currentCategory) {
    return null;
  }

  return {
    categories: categories.map(mapCategory),
    currentCategory: mapCategory(currentCategory),
    posts: posts.map(mapPostSummary),
  };
}

export async function getPostBySlug(locale: SanityLocale, slug: string) {
  if (!isSanityConfigured()) {
    return null;
  }

  const post = await sanityFetch<SanityPostDetail | null>({
    query: postBySlugQuery(locale),
    params: { slug },
    source: 'live',
    tags: ['blog:posts', `blog:post:${slug}`],
  });

  if (!post) {
    return null;
  }

  return {
    author_bio: post.author?.bio,
    author_image: getImageUrl(post.author?.image, 240),
    author_name: post.author?.name,
    body: <SanityPortableText value={post.body} />,
    categories: post.categories?.map(mapCategory) || [],
    created_at: formatDate(post.publishedAt),
    description: post.excerpt,
    id: post._id,
    image: getImageUrl(post.coverImage, 1600),
    noindex: post.noindex,
    seo_description: post.seoDescription,
    seo_title: post.seoTitle,
    slug: post.slug,
    slug_en: post.slugEn,
    slug_zh: post.slugZh,
    title: post.title,
    toc: getPortableTextToc(post.body),
    updated_at: formatDate(post.updatedAt),
  };
}

export async function getBlogSitemapEntries() {
  if (!isSanityConfigured()) {
    return {
      categories: [] as SanitySitemapCategory[],
      posts: [] as SanitySitemapPost[],
    };
  }

  const [categories, posts] = await Promise.all([
    sanityFetch<SanitySitemapCategory[]>({
      query: sitemapCategoriesQuery,
      source: 'live',
      tags: ['blog:sitemap', 'blog:categories'],
    }),
    sanityFetch<SanitySitemapPost[]>({
      query: sitemapPostsQuery,
      source: 'live',
      tags: ['blog:sitemap', 'blog:posts'],
    }),
  ]);

  return { categories, posts };
}
