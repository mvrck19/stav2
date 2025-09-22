import { test, expect, devices } from '@playwright/test';
import { getQuestions } from './helpers';

test.use({ ...devices['iPhone 8'] });

test('2. Question Display (Text, Choices, Feedback, Next)', async ({ page }) => {
  const { categories } = await getQuestions(page);
  const firstCategory = categories[0];
  const firstQuestion = firstCategory.questions[0];

  await page.goto('http://localhost:3000/index.html');
  await page.locator('.category-btn', { hasText: firstCategory.title }).click();

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

  await page.waitForFunction(
    (expectedCount) => {
      const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
      if (!qSvgObj || !qSvgObj.contentDocument) return false;
      try {
        const svgDoc = qSvgObj.contentDocument;
        const choiceButtons = svgDoc.querySelectorAll('.choice-btn');
        return choiceButtons.length === expectedCount;
      } catch (e) {
        return false;
      }
    },
    firstQuestion.choices.length,
    { timeout: 10000 }
  );

  const correctChoiceIndex = firstQuestion.correctIndex;
  const correctChoiceText = firstQuestion.choices[correctChoiceIndex];
  await page.evaluate((correctIndex) => {
    const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
    if (qSvgObj && qSvgObj.contentDocument) {
      const svgDoc = qSvgObj.contentDocument;
      const choiceBtn = svgDoc.querySelector(`.choice-btn[data-original-index="${correctIndex}"]`) as HTMLElement;
      if (choiceBtn) choiceBtn.click();
    }
  }, correctChoiceIndex);

  await page.evaluate(() => {
    const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
    if (qSvgObj && qSvgObj.contentDocument) {
      const svgDoc = qSvgObj.contentDocument;
      const submitBtn = svgDoc.querySelector('#submit-btn') as HTMLElement;
      if (submitBtn) submitBtn.click();
    }
  });

  await page.waitForFunction(
    ({ expectedText, expectedChoiceText }) => {
      const aSvgObj = document.getElementById('aSvg') as HTMLObjectElement;
      if (!aSvgObj || !aSvgObj.contentDocument) return false;
      try {
        const svgDoc = aSvgObj.contentDocument;
        const resultStatus = svgDoc.querySelector('#result-status');
        const userChoice = svgDoc.querySelector('#user-choice');
        return resultStatus && resultStatus.textContent?.includes(expectedText) &&
               userChoice && userChoice.textContent?.includes(expectedChoiceText);
      } catch (e) {
        return false;
      }
    },
    { expectedText: 'Σωστό! 🎉', expectedChoiceText: correctChoiceText },
    { timeout: 10000 }
  );

  await page.waitForFunction(
    () => {
      const aSvgObj = document.getElementById('aSvg') as HTMLObjectElement;
      if (!aSvgObj || !aSvgObj.contentDocument) return false;
      try {
        const svgDoc = aSvgObj.contentDocument;
        const nextBtn = svgDoc.querySelector('#next-btn');
        return nextBtn && (nextBtn as HTMLElement).style.display !== 'none';
      } catch (e) {
        return false;
      }
    },
    { timeout: 10000 }
  );

  await page.evaluate(() => {
    const aSvgObj = document.getElementById('aSvg') as HTMLObjectElement;
    if (aSvgObj && aSvgObj.contentDocument) {
      const svgDoc = aSvgObj.contentDocument;
      const nextBtn = svgDoc.querySelector('#next-btn') as HTMLElement;
      if (nextBtn) nextBtn.click();
    }
  });

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
    firstCategory.questions[1].question,
    { timeout: 10000 }
  );
});
