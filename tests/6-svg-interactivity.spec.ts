import { test, expect, devices } from '@playwright/test';
import { getQuestions } from './helpers';

test.use({ ...devices['iPhone 8'] });

test('6. SVG Interactivity', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.locator('.category-btn').first().click();

  await page.waitForFunction(
    () => {
      const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
      if (!qSvgObj || !qSvgObj.contentDocument) return false;
      try {
        const svgDoc = qSvgObj.contentDocument;
        const submitBtn = svgDoc.querySelector('#submit-btn') as HTMLButtonElement;
        return submitBtn && (submitBtn.style.display === 'none' || submitBtn.disabled);
      } catch (e) {
        return false;
      }
    },
    { timeout: 10000 }
  );

  await page.evaluate(() => {
    const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
    if (qSvgObj && qSvgObj.contentDocument) {
      const svgDoc = qSvgObj.contentDocument;
      const choiceBtn = svgDoc.querySelector('.choice-btn') as HTMLElement;
      if (choiceBtn) choiceBtn.click();
    }
  });

  await page.waitForFunction(
    () => {
      const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
      if (!qSvgObj || !qSvgObj.contentDocument) return false;
      try {
        const svgDoc = qSvgObj.contentDocument;
        const submitBtn = svgDoc.querySelector('#submit-btn') as HTMLButtonElement;
        return submitBtn && submitBtn.style.display !== 'none' && !submitBtn.disabled;
      } catch (e) {
        return false;
      }
    },
    { timeout: 10000 }
  );
});
