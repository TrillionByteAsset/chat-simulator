import { defineField, defineType } from 'sanity';

export const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'object',
      options: {
        columns: 2,
      },
      fields: [
        defineField({
          name: 'zh',
          title: 'Chinese Slug',
          type: 'slug',
          options: {
            source: (document: any) => document?.title?.zh,
            maxLength: 96,
          },
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'en',
          title: 'English Slug',
          type: 'slug',
          options: {
            source: (document: any) => document?.title?.en,
            maxLength: 96,
          },
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) =>
        Rule.custom((value: any) => {
          if (value?.zh?.current && value?.en?.current) {
            return true;
          }

          return 'Both Chinese and English slugs are required.';
        }),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'localizedText',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'localizedBody',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'localizedString',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'localizedText',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'coverImageAlt',
      title: 'Cover Image Alt',
      type: 'localizedString',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'noindex',
      title: 'Noindex',
      type: 'boolean',
      initialValue: false,
      description: 'Prevent this article from appearing in sitemap and search results metadata.',
    }),
  ],
  orderings: [
    {
      title: 'Published Date, New',
      by: [{ field: 'publishedAt', direction: 'desc' }],
      name: 'publishedDesc',
    },
  ],
  preview: {
    select: {
      media: 'coverImage',
      publishedAt: 'publishedAt',
      title: 'title.en',
      titleZh: 'title.zh',
    },
    prepare({ media, publishedAt, title, titleZh }) {
      return {
        media,
        subtitle: publishedAt
          ? new Date(publishedAt).toLocaleDateString()
          : 'Unscheduled',
        title: title || titleZh || 'Untitled post',
      };
    },
  },
});
