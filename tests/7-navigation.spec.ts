import { test, expect, devices } from '@playwright/test';
import { getQuestions } from './helpers';

test.use({ ...devices['iPhone 8'] });

test('7. Navigation', async ({ page }) => {
  await page.goto('http://localhost:3000/index.html');
  await page.locator('.category-btn').first().click();
  await expect(page.locator('#cards-container')).toBeVisible();
  await page.locator('#backToCategories').click();
  await expect(page.locator('#summaryModal')).toBeVisible();
  await page.locator('#summaryReturnBtn').click();
  await expect(page.locator('#category-screen')).toBeVisible();

  await page.locator('.category-btn').first().click();
  const { categories } = await getQuestions(page);
  const firstCategory = categories[0];

  for (const question of firstCategory.questions) {
    await page.waitForTimeout(500);
    await page.evaluate((correctIndex) => {
      const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
      if (qSvgObj && qSvgObj.contentDocument) {
        const svgDoc = qSvgObj.contentDocument;
        const choiceBtn = svgDoc.querySelector(`.choice-btn[data-original-index="${correctIndex}"]`) as HTMLElement;
        if (choiceBtn) choiceBtn.click();
      }
    }, question.correctIndex);

    await page.waitForTimeout(300);

    await page.evaluate(() => {
      const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
      if (qSvgObj && qSvgObj.contentDocument) {
        const svgDoc = qSvgObj.contentDocument;
        const submitBtn = svgDoc.querySelector('#submit-btn') as HTMLElement;
        if (submitBtn) submitBtn.click();
      }
    });

    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      const aSvgObj = document.getElementById('aSvg') as HTMLObjectElement;
      if (aSvgObj && aSvgObj.contentDocument) {
        const svgDoc = aSvgObj.contentDocument;
        const nextBtn = svgDoc.querySelector('#next-btn') as HTMLElement;
        if (nextBtn) nextBtn.click();
      }
    });
  }

  await expect(page.locator('#summaryModal')).toBeVisible();
  await page.locator('#summaryReturnBtn').click();
  await expect(page.locator('#category-screen')).toBeVisible();
});
