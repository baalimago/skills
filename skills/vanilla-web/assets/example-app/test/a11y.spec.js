import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const documents = ['/', '/todo.html', '/profile.html'];
const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const path of documents) {
  test(`${path} passes axe after islands upgrade`, async ({ page }) => {
    await page.goto(path);
    await page.waitForFunction(() =>
      [...document.querySelectorAll('todo-list, user-card')].every((el) => el.matches(':defined')),
    );
    const { violations } = await new AxeBuilder({ page }).withTags(tags).analyze();
    expect(violations).toEqual([]);
  });
}

test.describe('before upgrade', () => {
  for (const path of documents) {
    test(`${path} passes axe when no module loads`, async ({ page }) => {
      await page.route('**/*.js', (route) => route.abort());
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page }).withTags(tags).analyze();
      expect(violations).toEqual([]);
    });
  }
});
