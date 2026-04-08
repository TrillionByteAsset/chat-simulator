import { defineField, defineType } from 'sanity';

export const localizedText = defineType({
  fields: [
    defineField({
      name: 'zh',
      title: 'Chinese',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'text',
      rows: 4,
    }),
  ],
  name: 'localizedText',
  options: {
    columns: 2,
  },
  title: 'Localized Text',
  type: 'object',
});
