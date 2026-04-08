import { defineField, defineType } from 'sanity';

export const category = defineType({
  name: 'category',
  title: 'Category',
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
      name: 'description',
      title: 'Description',
      type: 'localizedText',
    }),
    defineField({
      name: 'orderRank',
      title: 'Order Rank',
      type: 'number',
      initialValue: 100,
    }),
  ],
  preview: {
    select: {
      title: 'title.en',
      titleZh: 'title.zh',
    },
    prepare({ title, titleZh }) {
      return {
        title: title || titleZh || 'Untitled category',
      };
    },
  },
});
