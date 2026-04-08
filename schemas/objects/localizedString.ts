import { defineField, defineType } from 'sanity';

export const localizedString = defineType({
  fields: [
    defineField({
      name: 'zh',
      title: 'Chinese',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
  ],
  name: 'localizedString',
  options: {
    columns: 2,
  },
  title: 'Localized String',
  type: 'object',
});
