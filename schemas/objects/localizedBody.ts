import { defineArrayMember, defineField, defineType } from 'sanity';

const richTextBlocks = [
  defineArrayMember({
    styles: [
      { title: 'Normal', value: 'normal' },
      { title: 'H2', value: 'h2' },
      { title: 'H3', value: 'h3' },
      { title: 'Quote', value: 'blockquote' },
    ],
    lists: [
      { title: 'Bullet', value: 'bullet' },
      { title: 'Numbered', value: 'number' },
    ],
    marks: {
      decorators: [
        { title: 'Strong', value: 'strong' },
        { title: 'Emphasis', value: 'em' },
        { title: 'Code', value: 'code' },
      ],
      annotations: [
        {
          name: 'link',
          title: 'Link',
          type: 'object',
          fields: [
            defineField({
              name: 'href',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
    },
    type: 'block',
  }),
  defineArrayMember({
    type: 'image',
    options: {
      hotspot: true,
    },
    fields: [
      defineField({
        name: 'alt',
        title: 'Alt Text',
        type: 'string',
      }),
      defineField({
        name: 'caption',
        title: 'Caption',
        type: 'string',
      }),
    ],
  }),
];

export const localizedBody = defineType({
  fields: [
    defineField({
      name: 'zh',
      title: 'Chinese',
      type: 'array',
      of: richTextBlocks,
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'array',
      of: richTextBlocks,
    }),
  ],
  name: 'localizedBody',
  options: {
    columns: 2,
  },
  title: 'Localized Body',
  type: 'object',
});
