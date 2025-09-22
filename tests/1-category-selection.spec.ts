import { test, expect, devices } from '@playwright/test';
import { getQuestions } from './helpers';

test.use({ ...devices['iPhone 8'] });

test('1. Category Selection Flow', async ({ page }) => {
  const { categories } = await getQuestions(page);
  await page.goto('http://localhost:3000/index.html');
  for (const category of categories) {
    await expect(page.locator('.category-btn', { hasText: category.title })).toBeVisible();
  }
  const firstCategory = categories[0];
  await page.locator('.category-btn', { hasText: firstCategory.title }).click();
  await expect(page.locator('#cards-container')).toBeVisible();
  const qSvg = page.locator('object#qSvg');
  const aSvg = page.locator('object#aSvg');
  await expect(qSvg).toBeVisible();
  await expect(aSvg).toBeVisible();
  const expectedSvg = firstCategory.id === 'grammar' ? 'svg/grammar_q.svg' : 'svg/syntax_q.svg';
  await expect(qSvg).toHaveAttribute('data', expectedSvg);
});
