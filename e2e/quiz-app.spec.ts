import { test, expect, devices } from '@playwright/test';

// Use mobile viewport for all tests
test.use({ ...devices['iPhone 8'] });

const getQuestions = async (page) => {
  return await page.evaluate(async () => {
    const res = await fetch('questions.json');
    return await res.json();
  });
};

test.describe('Quiz App E2E Tests', () => {


  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/index.html');
    // Clear localStorage and any other state after page loads
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    // Reload to ensure clean state
    await page.reload();
  });

  test('1. Category Selection Flow', async ({ page }) => {
    const { categories } = await getQuestions(page);
    // Verify that all categories from questions.json are displayed
    for (const category of categories) {
      await expect(page.locator('.category-btn', { hasText: category.title })).toBeVisible();
    }
    // Test that selecting a category loads the correct set of questions and SVGs
    const firstCategory = categories[0];
    await page.locator('.category-btn', { hasText: firstCategory.title }).click();
    await expect(page.locator('#cards-container')).toBeVisible();
    // Check if the correct SVG is loaded
    const qSvg = page.locator('object#qSvg');
    const aSvg = page.locator('object#aSvg');
    await expect(qSvg).toBeVisible();
    await expect(aSvg).toBeVisible();
    const expectedSvg = firstCategory.id === 'grammar' ? 'grammar_q.svg' : 'syntax_q.svg';
    await expect(qSvg).toHaveAttribute('data', expectedSvg);
  });

  test('2.1. Question Display - Question Text', async ({ page }) => {
    const { categories } = await getQuestions(page);
    const firstCategory = categories[0];
    const firstQuestion = firstCategory.questions[0];

    // Select the first category
    await page.locator('.category-btn', { hasText: firstCategory.title }).click();

    // Wait for SVG to load and question text to be updated
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
  });

  test('2.2. Question Display - Choices Count', async ({ page }) => {
    const { categories } = await getQuestions(page);
    const firstCategory = categories[0];
    const firstQuestion = firstCategory.questions[0];

    // Select the first category
    await page.locator('.category-btn', { hasText: firstCategory.title }).click();

    // Wait for choices inside the SVG
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
  });

  test('2.3. Question Display - Correct Answer Feedback', async ({ page }) => {
    const { categories } = await getQuestions(page);
    const firstCategory = categories[0];
    const firstQuestion = firstCategory.questions[0];

    // Select the first category
    await page.locator('.category-btn', { hasText: firstCategory.title }).click();

    // Wait for question to load
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

    // Select a correct answer inside the question SVG
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

    // Click submit button inside the question SVG
    await page.evaluate(() => {
      const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
      if (qSvgObj && qSvgObj.contentDocument) {
        const svgDoc = qSvgObj.contentDocument;
        const submitBtn = svgDoc.querySelector('#submit-btn') as HTMLElement;
        if (submitBtn) submitBtn.click();
      }
    });

    // Check for correct feedback in the answer SVG
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
  });

  test('2.4. Question Display - Next Question', async ({ page }) => {
    const { categories } = await getQuestions(page);
    const firstCategory = categories[0];
    const firstQuestion = firstCategory.questions[0];

    // Select the first category
    await page.locator('.category-btn', { hasText: firstCategory.title }).click();

    // Wait for first question to load
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

    // Select an answer inside the question SVG
    const correctChoiceIndex = firstQuestion.correctIndex;
    await page.evaluate((correctIndex) => {
      const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
      if (qSvgObj && qSvgObj.contentDocument) {
        const svgDoc = qSvgObj.contentDocument;
        const choiceBtn = svgDoc.querySelector(`.choice-btn[data-original-index="${correctIndex}"]`) as HTMLElement;
        if (choiceBtn) choiceBtn.click();
      }
    }, correctChoiceIndex);
    
    // Click submit button inside the question SVG
    await page.evaluate(() => {
      const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
      if (qSvgObj && qSvgObj.contentDocument) {
        const svgDoc = qSvgObj.contentDocument;
        const submitBtn = svgDoc.querySelector('#submit-btn') as HTMLElement;
        if (submitBtn) submitBtn.click();
      }
    });

    // Wait for the card to flip and answer to be shown - next button should be in answer SVG
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

    // Click "Next" inside the answer SVG
    await page.evaluate(() => {
      const aSvgObj = document.getElementById('aSvg') as HTMLObjectElement;
      if (aSvgObj && aSvgObj.contentDocument) {
        const svgDoc = aSvgObj.contentDocument;
        const nextBtn = svgDoc.querySelector('#next-btn') as HTMLElement;
        if (nextBtn) nextBtn.click();
      }
    });

    // Wait for second question to load
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

  test('3. Score and Progress', async ({ page }) => {
    const { categories } = await getQuestions(page);
    const firstCategory = categories[0];
    const firstQuestion = firstCategory.questions[0];
    await page.locator('.category-btn', { hasText: firstCategory.title }).click();
    await expect(page.locator('#globalScore')).toHaveText('Points: 0');
    await expect(page.locator('#progressBarText')).toHaveText(`1 / ${firstCategory.questions.length}`);
    
    // Wait for first question to load
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
    
    // Answer correctly using SVG interaction
    const correctChoiceIndex = firstQuestion.correctIndex;
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
    
    // Ensure the score increments by 10
    await expect(page.locator('#globalScore')).toHaveText('Points: 10');
    
    // Click next button in answer SVG
    await page.evaluate(() => {
      const aSvgObj = document.getElementById('aSvg') as HTMLObjectElement;
      if (aSvgObj && aSvgObj.contentDocument) {
        const svgDoc = aSvgObj.contentDocument;
        const nextBtn = svgDoc.querySelector('#next-btn') as HTMLElement;
        if (nextBtn) nextBtn.click();
      }
    });
    
    // Check progress indicator for the next question
    await expect(page.locator('#progressBarText')).toHaveText(`2 / ${firstCategory.questions.length}`);
    
    // Manually complete all remaining questions
    for (let i = 1; i < firstCategory.questions.length; i++) {
      const question = firstCategory.questions[i];
      
      // Wait for question to load
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
      
      // Select and submit answer
      await page.evaluate((correctIndex) => {
        const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
        if (qSvgObj && qSvgObj.contentDocument) {
          const svgDoc = qSvgObj.contentDocument;
          const choiceBtn = svgDoc.querySelector(`.choice-btn[data-original-index="${correctIndex}"]`) as HTMLElement;
          if (choiceBtn) choiceBtn.click();
        }
      }, question.correctIndex);
      
      await page.evaluate(() => {
        const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
        if (qSvgObj && qSvgObj.contentDocument) {
          const svgDoc = qSvgObj.contentDocument;
          const submitBtn = svgDoc.querySelector('#submit-btn') as HTMLElement;
          if (submitBtn) submitBtn.click();
        }
      });
      
      // Click next to proceed to next question or show summary
      await page.evaluate(() => {
        const aSvgObj = document.getElementById('aSvg') as HTMLObjectElement;
        if (aSvgObj && aSvgObj.contentDocument) {
          const svgDoc = aSvgObj.contentDocument;
          const nextBtn = svgDoc.querySelector('#next-btn') as HTMLElement;
          if (nextBtn) nextBtn.click();
        }
      });
    }
    
    // At the end, verify the session summary modal shows correct stats
    await expect(page.locator('#summaryModal')).toBeVisible();
    await expect(page.locator('#summaryPoints')).toHaveText((firstCategory.questions.length * 10).toString());
    await expect(page.locator('#summaryAccuracy')).toHaveText('100%');
    await expect(page.locator('#summaryCorrect')).toHaveText(`${firstCategory.questions.length}/${firstCategory.questions.length}`);
  });

  test('4. High Score Persistence', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    const { categories } = await getQuestions(page);
    const firstCategory = categories[0];
    await page.locator('.category-btn', { hasText: firstCategory.title }).click();
    
    // Wait for first question to load
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
    
    // Answer one question correctly using SVG interaction
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
    
    // Wait for score to update after submission
    await expect(page.locator('#globalScore')).toHaveText('Points: 10');
    
    // Go back to categories to trigger summary and save score
    await page.locator('#backToCategories').click();
    await expect(page.locator('#summaryModal')).toBeVisible();
    await expect(page.locator('#highScoreNotice')).toBeVisible();
    await page.locator('#summaryReturnBtn').click();
    // Verify high score is displayed on the category button
    await expect(page.locator('.category-btn', { hasText: firstCategory.title }).locator('.high-score')).toContainText('10');
    // Refresh the page and verify the high score is still displayed
    await page.reload();
    await expect(page.locator('.category-btn', { hasText: firstCategory.title }).locator('.high-score')).toContainText('10');
  });

  test('5. Mobile Responsiveness', async ({ page }) => {
    await expect(page.locator('.container')).toBeVisible();
    // Check that category buttons stack vertically on mobile
    const cat1 = await page.locator('.category-btn').nth(0).boundingBox();
    const cat2 = await page.locator('.category-btn').nth(1).boundingBox();
    expect(cat1).not.toBeNull();
    expect(cat2).not.toBeNull();
    expect(cat1!.y).toBeLessThan(cat2!.y);
    expect(cat1!.x).toBeCloseTo(cat2!.x, 5);
  });

  test('6. SVG Interactivity', async ({ page }) => {
    await page.locator('.category-btn').first().click();
    
    // Wait for question to load and verify submit button is initially hidden inside SVG
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
    
    // Click a choice button inside the SVG
    await page.evaluate(() => {
      const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
      if (qSvgObj && qSvgObj.contentDocument) {
        const svgDoc = qSvgObj.contentDocument;
        const choiceBtn = svgDoc.querySelector('.choice-btn') as HTMLElement;
        if (choiceBtn) choiceBtn.click();
      }
    });
    
    // Verify submit button is now visible and enabled inside SVG
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

  test('7. Navigation', async ({ page }) => {
    // Test "Back to Categories" button
    await page.locator('.category-btn').first().click();
    await expect(page.locator('#cards-container')).toBeVisible();
    await page.locator('#backToCategories').click();
    await expect(page.locator('#summaryModal')).toBeVisible();
    await page.locator('#summaryReturnBtn').click();
    await expect(page.locator('#category-screen')).toBeVisible();
    
    // Test returning from the summary modal after finishing
    await page.locator('.category-btn').first().click();
    const { categories } = await getQuestions(page);
    const firstCategory = categories[0];
    
    for (const question of firstCategory.questions) {
      // Wait for question to load
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
      
      // Select answer inside question SVG
      await page.evaluate((correctIndex) => {
        const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
        if (qSvgObj && qSvgObj.contentDocument) {
          const svgDoc = qSvgObj.contentDocument;
          const choiceBtn = svgDoc.querySelector(`.choice-btn[data-original-index="${correctIndex}"]`) as HTMLElement;
          if (choiceBtn) choiceBtn.click();
        }
      }, question.correctIndex);
      
      // Submit answer inside question SVG
      await page.evaluate(() => {
        const qSvgObj = document.getElementById('qSvg') as HTMLObjectElement;
        if (qSvgObj && qSvgObj.contentDocument) {
          const svgDoc = qSvgObj.contentDocument;
          const submitBtn = svgDoc.querySelector('#submit-btn') as HTMLElement;
          if (submitBtn) submitBtn.click();
        }
      });
      
      // Click next button inside answer SVG
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
});
