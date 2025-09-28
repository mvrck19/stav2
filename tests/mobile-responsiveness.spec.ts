import { test, expect, devices } from '@playwright/test';
import { getQuestions } from './helpers';


test('Mobile Responsiveness', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.locator('.container')).toBeVisible();
  const cat1 = await page.locator('.category-btn').nth(0).boundingBox();
  const cat2 = await page.locator('.category-btn').nth(1).boundingBox();
  expect(cat1).not.toBeNull();
  expect(cat2).not.toBeNull();
  expect(cat1!.y).toBeLessThan(cat2!.y);
  expect(cat1!.x).toBeCloseTo(cat2!.x, 5);
});
