import postgres, { type Sql } from 'postgres'

let client: Sql | null | undefined

export function getDatabase(): Sql | null {
  if (client !== undefined) return client
  const databaseUrl = useRuntimeConfig().databaseUrl
  client = databaseUrl ? postgres(databaseUrl, { max: 10, idle_timeout: 20, connect_timeout: 10 }) : null
  return client
}
