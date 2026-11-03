import { test, expect } from '@playwright/test';

/** @param {import('@playwright/test').Page} page */
async function openUpgraded(page) {
  await page.goto('/todo.html');
  await expect(page.locator('todo-list:defined')).toHaveCount(1);
  return page.getByRole('textbox', { name: 'New todo' });
}

test('adds, completes and removes a todo from the keyboard', async ({ page }) => {
  const input = await openUpgraded(page);
  await input.fill('Buy milk');
  await input.press('Enter');
  await expect(page.getByRole('status')).toHaveText('Added Buy milk.');

  await page.getByRole('checkbox', { name: 'Buy milk' }).press('Space');
  await page.reload();
  await expect(page.getByRole('checkbox', { name: 'Buy milk' })).toBeChecked();

  await page.getByRole('button', { name: 'Remove Buy milk' }).press('Enter');
  await expect(page.getByRole('checkbox', { name: 'Buy milk' })).toHaveCount(0);
  await expect(input).toBeFocused();
  await expect(page.getByRole('status')).toHaveText('Removed Buy milk.');
});

test('keeps a todo submitted before the island upgrades', async ({ page }) => {
  await page.route('**/todo-list/todo-list.js', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.continue();
  });
  await page.goto('/todo.html');
  await page.getByRole('textbox', { name: 'New todo' }).fill('Early bird');
  await page.getByRole('textbox', { name: 'New todo' }).press('Enter');
  await expect(page.getByRole('checkbox', { name: 'Early bird' })).toHaveCount(1);
  await expect(page).toHaveURL(/\/todo\.html$/);
});

test('rejects a blank todo with native validation', async ({ page }) => {
  const input = await openUpgraded(page);
  await input.fill('   ');
  await input.press('Enter');
  const items = page.getByRole('listitem').filter({ has: page.getByRole('checkbox') });
  await expect(items).toHaveCount(0);
  const valid = await input.evaluate((el) => /** @type {HTMLInputElement} */ (el).validity.valid);
  expect(valid).toBe(false);
});
