import { defineField, defineType } from 'sanity'

export const communityEvent = defineType({
  name: 'communityEvent',
  title: 'ERISED event',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'kind',
      type: 'string',
      options: { list: ['Screening', 'Workshop', 'Talk', 'Publication', 'Jam'] },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'date',
      type: 'string',
      description: 'Displayed verbatim, e.g. 12 Sep 2026.',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'location', type: 'string' }),
    defineField({ name: 'blurb', type: 'text', rows: 3 }),
    defineField({
      name: 'story',
      type: 'text',
      rows: 10,
      description: 'The magazine feature for this event. Separate paragraphs with a blank line.',
    }),
    defineField({ name: 'pullQuote', title: 'Pull quote', type: 'string' }),
    defineField({
      name: 'status',
      type: 'string',
      options: { list: ['upcoming', 'past'], layout: 'radio' },
      initialValue: 'upcoming',
    }),
    defineField({ name: 'seats', type: 'string', description: 'e.g. 40 seats or Sold out' }),
    defineField({ name: 'order', type: 'number', initialValue: 0 }),
  ],
  orderings: [
    { name: 'order', title: 'Display order', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: { select: { title: 'title', subtitle: 'date' } },
})
