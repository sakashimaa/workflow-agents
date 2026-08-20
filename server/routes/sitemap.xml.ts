const publicRoutes = ['/', '/faq', '/help', '/articles', '/articles/request-priority', '/articles/sla-basics', '/articles/good-request']

export default defineEventHandler((event) => {
  const siteUrl = useRuntimeConfig(event).public.siteUrl.replace(/\/$/, '')
  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'cache-control', 'public, max-age=3600')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${publicRoutes.map(route => `\n  <url><loc>${siteUrl}${route}</loc></url>`).join('')}\n</urlset>`
})
