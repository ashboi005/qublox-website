import { defineCliConfig } from 'sanity/cli'
import { dataset, projectId } from './src/sanity/env'

/**
 * Lets the Sanity CLI act on this project without repeating flags — dataset
 * creation, CORS origins, token management, schema deploy.
 *
 * The embedded Studio at /studio does not need any of it: it bundles the
 * schemas from sanity.config.ts at build time, so editing a file under
 * src/sanity/schemas and reloading is the whole deploy cycle. The CLI is for
 * the things that live on Sanity's side rather than in this repo.
 */
export default defineCliConfig({
  api: { projectId, dataset },
  autoUpdates: false,
})
