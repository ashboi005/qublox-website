import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({
      name: 'tagline',
      type: 'string',
      description: 'One line. Appears under the TV in the hero.',
      validation: (r) => r.required().max(120),
    }),
    defineField({
      name: 'aboutLead',
      title: 'About — lead line',
      type: 'text',
      rows: 2,
      description: 'The large statement. Word-by-word reveal, so keep it under ~20 words.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'aboutBody',
      title: 'About — paragraphs',
      type: 'array',
      of: [{ type: 'text', rows: 4 }],
    }),
    defineField({ name: 'techIntro', title: 'Tech — intro line', type: 'text', rows: 2 }),
    defineField({ name: 'communityLead', title: 'Community — lead line', type: 'text', rows: 3 }),
    defineField({ name: 'contactLead', title: 'Contact — lead line', type: 'text', rows: 3 }),
    defineField({ name: 'email', type: 'string', validation: (r) => r.required().email() }),
    defineField({
      name: 'location',
      type: 'string',
      description: 'Shown in the footer instrument strip.',
    }),
    defineField({
      name: 'socials',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'href', type: 'url', validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'label', subtitle: 'href' } },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
})
