'use client'

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { apiVersion, dataset, projectId } from './src/sanity/env'
import { schemaTypes } from './src/sanity/schemas'

export default defineConfig({
  basePath: '/studio',
  title: 'Qublox',
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Qublox')
          .items([
            S.listItem()
              .title('Site settings')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.divider(),
            S.documentTypeListItem('service').title('Services'),
            S.documentTypeListItem('project').title('Projects'),
            S.documentTypeListItem('techModule').title('Tech modules'),
            S.documentTypeListItem('teamMember').title('Team'),
            S.documentTypeListItem('communityEvent').title('ERISED events'),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
