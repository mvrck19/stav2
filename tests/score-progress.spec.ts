import { test, expect, devices } from '@playwright/test';
import { getQuestions } from './helpers';


test('Score and Progress', async ({ page }) => {
  const { categories } = await getQuestions(page);
  const firstCategory = categories[0];
  const firstQuestion = firstCategory.questions[0];

  await page.goto('http://localhost:3000/');
  await page.locator('.category-btn', { hasText: firstCategory.title }).click();
  await expect(page.locator('#globalScore')).toHaveText('Points: 0');
  await expect(page.locator('#progressBarText')).toHaveText(`1 / ${firstCategory.questions.length}`);

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

  const correctChoiceIndex = firstQuestion.correctIndex;
  await page.waitForTimeout(500);
  await page.evaluate((correctIndex) => {
    const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
    if (qSvgObj && qSvgObj.contentDocument) {
      const svgDoc = qSvgObj.contentDocument;
      const choiceBtn = svgDoc.querySelector(`.choice-btn[data-original-index="${correctIndex}"]`) as HTMLElement;
      if (choiceBtn) choiceBtn.click();
    }
  }, correctChoiceIndex);

  await page.waitForTimeout(300);

  await page.evaluate(() => {
    const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
    if (qSvgObj && qSvgObj.contentDocument) {
      const svgDoc = qSvgObj.contentDocument;
      const submitBtn = svgDoc.querySelector('#submit-btn') as HTMLElement;
      if (submitBtn) submitBtn.click();
    }
  });

  await expect(page.locator('#globalScore')).toHaveText('Points: 10');
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    const aSvgObj = document.getElementById('aSvg') as HTMLObjectElement;
    if (aSvgObj && aSvgObj.contentDocument) {
      const svgDoc = aSvgObj.contentDocument;
      const nextBtn = svgDoc.querySelector('#next-btn') as HTMLElement;
      if (nextBtn) nextBtn.click();
    }
  });

  await expect(page.locator('#progressBarText')).toHaveText(`2 / ${firstCategory.questions.length}`);

  for (let i = 1; i < firstCategory.questions.length; i++) {
    const question = firstCategory.questions[i];
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
      question.question,
      { timeout: 10000 }
    );

    await page.waitForTimeout(500);

    await page.evaluate((correctIndex) => {
      const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
      if (qSvgObj && qSvgObj.contentDocument) {
        const svgDoc = qSvgObj.contentDocument;
        const choiceBtn = svgDoc.querySelector(`.choice-btn[data-original-index="${correctIndex}"]`) as HTMLElement;
        if (choiceBtn) {
          choiceBtn.click();
        }
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
  await expect(page.locator('#summaryPoints')).toHaveText((firstCategory.questions.length * 10).toString());
  await expect(page.locator('#summaryAccuracy')).toHaveText('100%');
  await expect(page.locator('#summaryCorrect')).toHaveText(`${firstCategory.questions.length}/${firstCategory.questions.length}`);
});
