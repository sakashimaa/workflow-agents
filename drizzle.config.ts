import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './server/database/schema.ts',
  out: './drizzle/generated',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NUXT_DATABASE_URL ?? 'postgres://workflow:workflow@localhost:5432/workflow',
  },
  strict: true,
  verbose: true,
})
