import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import postgres from 'postgres'

const databaseUrl = process.env.NUXT_DATABASE_URL
if (!databaseUrl) throw new Error('NUXT_DATABASE_URL is required')
const sql = postgres(databaseUrl, { max: 1 })

try {
  await sql`CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`
  const migrations = ['0000_initial', '0001_request_version', '0002_transition_history']
  for (const name of migrations) {
    const applied = await sql`SELECT name FROM schema_migrations WHERE name = ${name}`
    if (!applied.length) {
      const migration = await readFile(resolve(`drizzle/${name}.sql`), 'utf8')
      await sql.begin(async transaction => {
        await transaction.unsafe(migration)
        await transaction`INSERT INTO schema_migrations (name) VALUES (${name})`
      })
      console.log(`Applied ${name}`)
    } else {
      console.log(`${name} already applied`)
    }
  }
} finally {
  await sql.end()
}
