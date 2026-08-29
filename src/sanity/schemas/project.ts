import { defineField, defineType } from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  description: 'A frame that hangs off the camera’s light trail.',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'client', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'year', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'discipline', type: 'string' }),
    defineField({ name: 'blurb', type: 'text', rows: 3 }),
    defineField({
      name: 'image',
      type: 'image',
      options: { hotspot: true },
      description: 'Optional. Without one, a generated plate is drawn instead.',
      fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
    }),
    defineField({
      name: 'anchor',
      type: 'number',
      description: 'Where along the light trail this sits. 0 = start, 1 = end.',
      validation: (r) => r.required().min(0).max(1),
      initialValue: 0.5,
    }),
    defineField({
      name: 'side',
      type: 'string',
      options: { list: ['above', 'below'], layout: 'radio' },
      initialValue: 'above',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'plateHue',
      title: 'Plate hue',
      type: 'number',
      description: '0–360. Tints the generated plate when there is no image.',
      initialValue: 180,
      validation: (r) => r.min(0).max(360),
    }),
    defineField({
      name: 'plateVariant',
      title: 'Plate variant',
      type: 'string',
      options: { list: ['bars', 'grid', 'aperture', 'waveform', 'noise', 'orbit'] },
      initialValue: 'bars',
    }),
  ],
  orderings: [
    { name: 'anchor', title: 'Position on trail', by: [{ field: 'anchor', direction: 'asc' }] },
  ],
  preview: { select: { title: 'title', subtitle: 'client', media: 'image' } },
})
