import { test, expect } from '@playwright/test';

test('the confirm dialog opens from markup, keeps focus and closes on Esc', async ({ page }) => {
  await page.goto('/profile.html');
  const invoker = page.getByRole('button', { name: 'Delete profile' });
  await invoker.click();
  const dialog = page.getByRole('dialog', { name: 'Delete this profile?' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(invoker).toBeFocused();
});

test('the dialog opens from markup when no module loads', async ({ page }) => {
  await page.route('**/*.js', (route) => route.abort());
  await page.goto('/profile.html');
  const dialog = page.getByRole('dialog', { name: 'Delete this profile?' });
  await expect(dialog).toBeHidden();
  await page.getByRole('button', { name: 'Delete profile' }).click();
  await expect(dialog).toBeVisible();
});

test('the page does not scroll under the modal', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 400 });
  await page.goto('/profile.html');
  await page.getByRole('button', { name: 'Delete profile' }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.move(10, 300);
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(before);
});
