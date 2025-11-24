import { test, expect } from '@playwright/test'

test('home page enables rolling after entering a name', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Where would you have been born/i })).toBeVisible()
  const rollButton = page.getByRole('button', { name: /Roll the Dice/i })
  await expect(rollButton).toBeDisabled()
  const input = page.getByLabel('Full name')
  await input.fill('Alan Turing')
  await expect(rollButton).toBeEnabled()
})
