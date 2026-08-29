import { defineField, defineType } from 'sanity'

export const teamMember = defineType({
  name: 'teamMember',
  title: 'Team member',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'role', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'serial',
      type: 'string',
      description: 'Printed on the ID card, e.g. QX-01-0001.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'jp',
      title: 'Japanese strip',
      type: 'string',
      description: 'Katakana shown beside the portrait.',
    }),
    defineField({ name: 'clearance', type: 'string', initialValue: 'LEVEL 3' }),
    defineField({ name: 'since', type: 'string' }),
    defineField({
      name: 'specs',
      type: 'array',
      description: 'Two rows read best on the card.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string' }),
            defineField({ name: 'value', type: 'string' }),
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        },
      ],
      validation: (r) => r.max(3),
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: { hotspot: true },
      description: 'Portrait. Rendered through a dither filter to match the card.',
    }),
    defineField({ name: 'hue', type: 'number', initialValue: 188, validation: (r) => r.min(0).max(360) }),
    defineField({ name: 'order', type: 'number', initialValue: 0 }),
  ],
  orderings: [
    { name: 'order', title: 'Display order', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: { select: { title: 'name', subtitle: 'role', media: 'image' } },
})
