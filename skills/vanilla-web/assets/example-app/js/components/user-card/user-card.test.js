import { test, expect } from '@playwright/test';

test('refreshes the declared profile from JSON', async ({ page }) => {
  await page.goto('/profile.html');
  const card = page.locator('user-card');
  await expect(card.getByRole('listitem')).toHaveCount(2);
  await expect(card.getByText('tests them in three browsers')).toBeVisible();
});

test('keeps the last known profile when the fetch fails', async ({ page }) => {
  await page.route('**/data/profile.json', (route) => route.fulfill({ status: 500 }));
  await page.goto('/profile.html');
  await expect(page.locator('user-card:state(stale)')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Ada Example' })).toBeVisible();
  await expect(page.locator('user-card').getByRole('listitem')).toHaveCount(1);
});
