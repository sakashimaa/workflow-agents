export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'content-security-policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    'permissions-policy': 'camera=(), microphone=(), geolocation=()',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
  })
  if (!import.meta.dev) setResponseHeader(event, 'strict-transport-security', 'max-age=31536000; includeSubDomains')
})
