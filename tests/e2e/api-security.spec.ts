import { expect, test } from '@playwright/test'

test('server authorization holds when UI is bypassed', async ({ request }) => {
  expect((await request.get('/api/requests')).status()).toBe(401)
  await request.post('/api/auth/login', { data: { email: 'client@workflow.local', password: 'Demo1234!' } })
  expect((await request.get('/api/requests/REQ-1041')).status()).toBe(403)
  expect((await request.patch('/api/requests/REQ-1042', { data: { priority: 'low', expectedVersion: 1 } })).status()).toBe(403)
})

test('business conflicts return meaningful status codes', async ({ request }) => {
  await request.post('/api/auth/login', { data: { email: 'operator@workflow.local', password: 'Demo1234!' } })
  expect((await request.post('/api/requests/REQ-1039/transition', { data: { to: 'closed', reason: 'Нельзя', expectedVersion: 1 } })).status()).toBe(409)
  expect((await request.patch('/api/requests/REQ-1039', { data: { assigneeId: 'user-inactive', expectedVersion: 1 } })).status()).toBe(409)
})
