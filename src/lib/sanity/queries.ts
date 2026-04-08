import { groq } from 'next-sanity';

export type SanityLocale = 'en' | 'zh';

function localizedValue(field: string, locale: SanityLocale) {
  const fallback = locale === 'zh' ? 'en' : 'zh';

  return `coalesce(${field}.${locale}, ${field}.${fallback})`;
}

function localizedSlug(field: string, locale: SanityLocale) {
  const fallback = locale === 'zh' ? 'en' : 'zh';

  return `coalesce(${field}.${locale}.current, ${field}.${fallback}.current)`;
}

export const postListQuery = (locale: SanityLocale) => groq`
  *[
    _type == "post" &&
    defined(slug.${locale}.current) &&
    !coalesce(noindex, false)
  ] | order(coalesce(publishedAt, _createdAt) desc) {
    _id,
    _updatedAt,
    "slug": ${localizedSlug('slug', locale)},
    "title": ${localizedValue('title', locale)},
    "excerpt": ${localizedValue('excerpt', locale)},
    "seoTitle": ${localizedValue('seoTitle', locale)},
    "seoDescription": ${localizedValue('seoDescription', locale)},
    "publishedAt": coalesce(publishedAt, _createdAt),
    coverImage,
    "author": author->{
      name,
      image,
      "bio": ${localizedValue('bio', locale)}
    },
    "categories": categories[]->{
      _id,
      "slugEn": slug.en.current,
      "slugZh": slug.zh.current,
      "slug": ${localizedSlug('slug', locale)},
      "title": ${localizedValue('title', locale)}
    }
  }
`;

export const postBySlugQuery = (locale: SanityLocale) => groq`
  *[
    _type == "post" &&
    slug.${locale}.current == $slug
  ][0]{
    _id,
    _createdAt,
    _updatedAt,
    featured,
    noindex,
    "slug": ${localizedSlug('slug', locale)},
    "slugZh": slug.zh.current,
    "slugEn": slug.en.current,
    "title": ${localizedValue('title', locale)},
    "excerpt": ${localizedValue('excerpt', locale)},
    "body": body.${locale},
    "seoTitle": ${localizedValue('seoTitle', locale)},
    "seoDescription": ${localizedValue('seoDescription', locale)},
    "publishedAt": coalesce(publishedAt, _createdAt),
    "updatedAt": coalesce(updatedAt, _updatedAt),
    coverImage,
    "coverImageAlt": ${localizedValue('coverImageAlt', locale)},
    "author": author->{
      _id,
      name,
      image,
      "bio": ${localizedValue('bio', locale)}
    },
    "categories": categories[]->{
      _id,
      "slugEn": slug.en.current,
      "slugZh": slug.zh.current,
      "slug": ${localizedSlug('slug', locale)},
      "title": ${localizedValue('title', locale)}
    }
  }
`;

export const categoryListQuery = (locale: SanityLocale) => groq`
  *[_type == "category"] | order(orderRank asc, title.${locale} asc) {
    _id,
    "slugEn": slug.en.current,
    "slugZh": slug.zh.current,
    "slug": ${localizedSlug('slug', locale)},
    "title": ${localizedValue('title', locale)},
    "description": ${localizedValue('description', locale)}
  }
`;

export const categoryBySlugQuery = (locale: SanityLocale) => groq`
  *[
    _type == "category" &&
    slug.${locale}.current == $slug
  ][0]{
    _id,
    "slugEn": slug.en.current,
    "slugZh": slug.zh.current,
    "slug": ${localizedSlug('slug', locale)},
    "title": ${localizedValue('title', locale)},
    "description": ${localizedValue('description', locale)}
  }
`;

export const siteSettingsQuery = (locale: SanityLocale) => groq`
  *[_type == "siteSettings"][0]{
    "siteTitle": ${localizedValue('siteTitle', locale)},
    "siteDescription": ${localizedValue('siteDescription', locale)},
    defaultOgImage,
    socialLinks
  }
`;

export const sitemapPostsQuery = groq`
  *[
    _type == "post" &&
    !coalesce(noindex, false)
  ]{
    _id,
    _updatedAt,
    publishedAt,
    "slugEn": slug.en.current,
    "slugZh": slug.zh.current
  }
`;

export const sitemapCategoriesQuery = groq`
  *[_type == "category"]{
    _id,
    _updatedAt,
    "slugEn": slug.en.current,
    "slugZh": slug.zh.current
  }
`;

export const postsByCategorySlugQuery = (locale: SanityLocale) => groq`
  *[
    _type == "post" &&
    defined(slug.${locale}.current) &&
    !coalesce(noindex, false) &&
    count((categories[]->slug.${locale}.current)[@ == $slug]) > 0
  ] | order(coalesce(publishedAt, _createdAt) desc) {
    _id,
    _updatedAt,
    "slug": ${localizedSlug('slug', locale)},
    "title": ${localizedValue('title', locale)},
    "excerpt": ${localizedValue('excerpt', locale)},
    "seoTitle": ${localizedValue('seoTitle', locale)},
    "seoDescription": ${localizedValue('seoDescription', locale)},
    "publishedAt": coalesce(publishedAt, _createdAt),
    coverImage,
    "author": author->{
      name,
      image,
      "bio": ${localizedValue('bio', locale)}
    },
    "categories": categories[]->{
      _id,
      "slugEn": slug.en.current,
      "slugZh": slug.zh.current,
      "slug": ${localizedSlug('slug', locale)},
      "title": ${localizedValue('title', locale)}
    }
  }
`;
