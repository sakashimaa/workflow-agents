const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS'])

export default defineEventHandler((event) => {
  if (safeMethods.has(event.method)) return
  const origin = getRequestHeader(event, 'origin')
  const host = getRequestHeader(event, 'host')
  if (!origin || !host) return
  const originHost = (() => {
    try { return new URL(origin).host }
    catch { throw createError({ statusCode: 403, statusMessage: 'Недопустимый Origin' }) }
  })()
  if (originHost !== host) throw createError({ statusCode: 403, statusMessage: 'Межсайтовый запрос отклонён' })
})
