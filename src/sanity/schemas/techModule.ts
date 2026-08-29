import { defineField, defineType } from 'sanity'

export const techModule = defineType({
  name: 'techModule',
  title: 'Tech module',
  type: 'document',
  description: 'One entry in the terminal readout.',
  fields: [
    defineField({
      name: 'code',
      type: 'string',
      description: 'Three letters, e.g. RND.',
      validation: (r) => r.required().length(3),
    }),
    defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'status',
      type: 'string',
      options: { list: ['ONLINE', 'STABLE', 'BETA'] },
      initialValue: 'ONLINE',
    }),
    defineField({
      name: 'lines',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Typed out one line at a time. Keep each under ~80 characters.',
    }),
    defineField({ name: 'order', type: 'number', initialValue: 0 }),
  ],
  orderings: [
    { name: 'order', title: 'Display order', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: { select: { title: 'name', subtitle: 'code' } },
})
