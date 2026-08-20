import type { H3Event } from 'h3'

const windowMs = 15 * 60 * 1000
const maximumFailures = 5
const failures = new Map<string, { count: number; resetAt: number }>()

function key(event: H3Event) { return getRequestIP(event, { xForwardedFor: true }) ?? 'unknown' }

export function assertLoginRateLimit(event: H3Event) {
  const bucket = failures.get(key(event))
  if (!bucket) return
  if (bucket.resetAt <= Date.now()) { failures.delete(key(event)); return }
  if (bucket.count >= maximumFailures) {
    setResponseHeader(event, 'retry-after', Math.ceil((bucket.resetAt - Date.now()) / 1000))
    throw createError({ statusCode: 429, statusMessage: 'Слишком много неудачных попыток. Повторите позже' })
  }
}

export function recordLoginFailure(event: H3Event) {
  const address = key(event)
  const current = failures.get(address)
  failures.set(address, current && current.resetAt > Date.now() ? { ...current, count: current.count + 1 } : { count: 1, resetAt: Date.now() + windowMs })
}

export function clearLoginFailures(event: H3Event) { failures.delete(key(event)) }
