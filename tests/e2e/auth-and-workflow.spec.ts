import { expect, test, type Page } from '@playwright/test'

async function gotoHydrated(page: Page, path: string) {
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true')
}

async function login(page: Page, account: 'Client' | 'Operator' | 'Agent' | 'Admin' = 'Operator') {
  await gotoHydrated(page, '/login')
  await page.getByRole('button', { name: account, exact: true }).click()
  await page.getByRole('button', { name: 'Войти', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
}

test('operator completes the critical request workflow', async ({ page }) => {
  await login(page)
  await gotoHydrated(page, '/requests')
  await page.getByRole('button', { name: 'Новая заявка' }).click()
  const title = `E2E заявка ${Date.now()}`
  await page.getByLabel('Тема').fill(title)
  await page.getByLabel('Описание').fill('Подробное описание заявки для сквозного автоматического теста.')
  await page.getByRole('button', { name: 'Создать', exact: true }).click()
  await page.getByRole('link', { name: new RegExp(title) }).click()

  await page.getByLabel('Исполнитель').selectOption({ label: 'Денис Фролов' })
  await expect(page.getByText('Назначена', { exact: true })).toBeVisible()
  await page.getByLabel('Следующий статус').selectOption('in_progress')
  await page.getByRole('dialog').getByRole('button', { name: 'Подтвердить' }).click()
  await expect(page.getByText('В работе', { exact: true })).toBeVisible()

  await page.getByLabel('Новый комментарий').fill('Комментарий отправлен ровно один раз.')
  await page.getByRole('button', { name: 'Отправить' }).dblclick()
  await expect(page.getByText('Комментарий отправлен ровно один раз.')).toHaveCount(1)

  await page.getByRole('button', { name: 'Выйти' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await gotoHydrated(page, '/requests')
  await expect(page).toHaveURL(/\/login\?redirect=/)
})

test('the latest search response wins', async ({ page }) => {
  await login(page)
  await page.route(/\/api\/requests\?.*/, async (route) => {
    if (new URL(route.request().url()).searchParams.get('q')?.includes('отчёт')) await new Promise(resolve => setTimeout(resolve, 800))
    await route.continue()
  })
  await gotoHydrated(page, '/requests')
  const search = page.getByLabel('Поиск')
  await search.fill('отчёт')
  await page.waitForTimeout(400)
  await search.fill('доступ')
  await expect(page.getByText('Настроить доступ новому сотруднику отдела')).toBeVisible()
  await page.waitForTimeout(1000)
  await expect(page.getByText('Настроить доступ новому сотруднику отдела')).toBeVisible()
  await expect(page.getByText('Не формируется отчёт по продажам за июль')).toHaveCount(0)
})
