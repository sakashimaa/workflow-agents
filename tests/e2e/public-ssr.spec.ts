import { expect, test } from '@playwright/test'

test('public pages return meaningful SSR HTML and metadata', async ({ page, request }) => {
  const response = await request.get('/')
  expect(response.status()).toBe(200)
  expect(await response.text()).toContain('Поддержка, в которой всё под контролем')

  const hydrationErrors: string[] = []
  page.on('console', message => { if (/hydration/i.test(message.text()) && message.type() === 'error') hydrationErrors.push(message.text()) })
  await page.goto('/articles/sla-basics')
  await expect(page).toHaveTitle(/Что такое SLA простыми словами/)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'http://localhost:3000/articles/sla-basics')
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article')
  expect(hydrationErrors).toEqual([])
})

test('sitemap, robots and article 404 are explicit', async ({ request }) => {
  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.headers()['content-type']).toContain('application/xml')
  expect(await sitemap.text()).toContain('/articles/sla-basics')
  const robots = await request.get('/robots.txt')
  expect(await robots.text()).toContain('Disallow: /admin')
  expect((await request.get('/articles/not-found')).status()).toBe(404)
})
