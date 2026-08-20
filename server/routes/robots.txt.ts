export default defineEventHandler((event) => {
  const siteUrl = useRuntimeConfig(event).public.siteUrl.replace(/\/$/, '')
  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /requests\nDisallow: /admin\nSitemap: ${siteUrl}/sitemap.xml\n`
})
