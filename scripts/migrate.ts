import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import postgres from 'postgres'

const databaseUrl = process.env.NUXT_DATABASE_URL
if (!databaseUrl) throw new Error('NUXT_DATABASE_URL is required')
const sql = postgres(databaseUrl, { max: 1 })

try {
  await sql`CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`
  const name = '0000_initial'
  const applied = await sql`SELECT name FROM schema_migrations WHERE name = ${name}`
  if (!applied.length) {
    const migration = await readFile(resolve('drizzle/0000_initial.sql'), 'utf8')
    await sql.begin(async transaction => {
      await transaction.unsafe(migration)
      await transaction`INSERT INTO schema_migrations (name) VALUES (${name})`
    })
    console.log(`Applied ${name}`)
  } else {
    console.log(`${name} already applied`)
  }
} finally {
  await sql.end()
}
