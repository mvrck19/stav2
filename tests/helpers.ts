import { Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export const getQuestions = async (_page: Page) => {
  const file = path.resolve(__dirname, '..', 'app', 'questions.json');
  const data = fs.readFileSync(file, { encoding: 'utf8' });
  return JSON.parse(data);
};
