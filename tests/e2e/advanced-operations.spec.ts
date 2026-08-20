import { expect, test } from '@playwright/test'

test('admin APIs, SLA and protected attachments work end to end', async ({ request }) => {
  expect((await request.post('/api/auth/login', { data: { email: 'admin@workflow.local', password: 'Demo1234!' } })).ok()).toBe(true)
  const analytics = await request.get('/api/admin/analytics')
  expect(analytics.ok()).toBe(true)
  expect((await analytics.json()).total).toBeGreaterThan(0)

  const policy = await request.put('/api/admin/sla/normal', { data: { responseMinutes: 240, resolutionMinutes: 1440, isActive: true } })
  expect(policy.ok()).toBe(true)

  const created = await request.post('/api/requests', { data: { title: `Заявка с файлом ${Date.now()}`, description: 'Проверка защищённой загрузки и скачивания вложения.', priority: 'normal', customerId: 'customer-northstar', categoryId: 'category-documents' } })
  expect(created.status()).toBe(201)
  const requestId = (await created.json()).id
  const uploaded = await request.post(`/api/requests/${requestId}/attachments`, { multipart: { files: { name: 'evidence.txt', mimeType: 'text/plain', buffer: Buffer.from('workflow attachment') } } })
  expect(uploaded.status()).toBe(201)
  const attachment = (await uploaded.json())[0]
  expect((await request.get(attachment.url)).ok()).toBe(true)

  const rejected = await request.post(`/api/requests/${requestId}/attachments`, { multipart: { files: { name: 'payload.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') } } })
  expect(rejected.status()).toBe(415)
})

test('only an admin can access the operations console', async ({ page, request }) => {
  await request.post('/api/auth/login', { data: { email: 'client@workflow.local', password: 'Demo1234!' } })
  expect((await request.get('/api/admin/analytics')).status()).toBe(403)

  await page.goto('/login')
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true')
  await page.getByRole('button', { name: 'Admin', exact: true }).click()
  await page.getByRole('button', { name: 'Войти', exact: true }).click()
  await page.goto('/admin/analytics')
  await expect(page.getByRole('heading', { name: 'Аналитика' })).toBeVisible()
  await expect(page.getByText('В пределах SLA')).toBeVisible()
})
