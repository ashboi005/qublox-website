import { defineField, defineType } from 'sanity'

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'marquee',
      type: 'string',
      description: 'Uppercase short form for the hero’s masked scrolling column.',
      validation: (r) => r.required().max(24),
    }),
    defineField({ name: 'description', type: 'text', rows: 3, validation: (r) => r.required() }),
    defineField({ name: 'capabilities', type: 'array', of: [{ type: 'string' }] }),
    defineField({
      name: 'order',
      type: 'number',
      description: 'Lower numbers appear first.',
      initialValue: 0,
    }),
  ],
  orderings: [
    { name: 'order', title: 'Display order', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: { select: { title: 'title', subtitle: 'marquee' } },
})
