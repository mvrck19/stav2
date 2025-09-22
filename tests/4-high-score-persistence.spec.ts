import { test, expect, devices } from '@playwright/test';
import { getQuestions } from './helpers';

test.use({ ...devices['iPhone 8'] });

test('4. High Score Persistence', async ({ page }) => {
  const { categories } = await getQuestions(page);
  const firstCategory = categories[0];
  await page.goto('http://localhost:3000/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.locator('.category-btn', { hasText: firstCategory.title }).click();

  const firstQuestion = firstCategory.questions[0];
  await page.waitForFunction(
    (expectedText) => {
      const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
      if (!qSvgObj || !qSvgObj.contentDocument) return false;
      try {
        const svgDoc = qSvgObj.contentDocument;
        const questionTextElement = svgDoc.querySelector('#question-text');
        return questionTextElement && questionTextElement.textContent?.includes(expectedText);
      } catch (e) {
        return false;
      }
    },
    firstQuestion.question,
    { timeout: 10000 }
  );

  await page.evaluate((correctIndex) => {
    const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
    if (qSvgObj && qSvgObj.contentDocument) {
      const svgDoc = qSvgObj.contentDocument;
      const choiceBtn = svgDoc.querySelector(`.choice-btn[data-original-index="${correctIndex}"]`) as HTMLElement;
      if (choiceBtn) choiceBtn.click();
    }
  }, firstQuestion.correctIndex);

  await page.evaluate(() => {
    const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
    if (qSvgObj && qSvgObj.contentDocument) {
      const svgDoc = qSvgObj.contentDocument;
      const submitBtn = svgDoc.querySelector('#submit-btn') as HTMLElement;
      if (submitBtn) submitBtn.click();
    }
  });

  await expect(page.locator('#globalScore')).toHaveText('Points: 10');
  await page.locator('#backToCategories').click();
  await expect(page.locator('#summaryModal')).toBeVisible();
  await expect(page.locator('#highScoreNotice')).toBeVisible();
  await page.locator('#summaryReturnBtn').click();
  await expect(page.locator('.category-btn', { hasText: firstCategory.title }).locator('.high-score')).toContainText('10');
  await page.reload();
  await expect(page.locator('.category-btn', { hasText: firstCategory.title }).locator('.high-score')).toContainText('10');
});
