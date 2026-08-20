import { getDatabase } from '../database/client'

export default defineEventHandler(async (event) => {
  const startedAt = Date.now()
  const database = getDatabase()
  if (!database) {
    if (!import.meta.dev) setResponseStatus(event, 503)
    return { status: import.meta.dev ? 'ok' : 'degraded', database: 'memory', responseMs: Date.now() - startedAt, timestamp: new Date().toISOString() }
  }
  try {
    await database`SELECT 1`
    return { status: 'ok', database: 'postgresql', responseMs: Date.now() - startedAt, timestamp: new Date().toISOString() }
  } catch {
    setResponseStatus(event, 503)
    return { status: 'unavailable', database: 'postgresql', responseMs: Date.now() - startedAt, timestamp: new Date().toISOString() }
  }
})
