import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('File Upload Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'アップロード' }).click();
    await expect(page.locator('[data-testid="file-upload-modal"]')).toBeVisible();
  });

  test('CSVファイルをアップロードして成功メッセージが表示される', async ({ page }) => {
    const filePath = path.resolve(__dirname, 'test-data.csv');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    await page.locator('[data-testid="upload-button"]').click();

    await expect(page.locator('text=アップロード完了')).toBeVisible();
  });

  test('ドラッグ&ドロップでCSVをアップロード', async ({ page }) => {
    const filePath = path.resolve(__dirname, 'test-data.csv');
    const buffer = fs.readFileSync(filePath);
    const dropZone = page.locator('[data-testid="drop-zone"]');

    await dropZone.evaluate((element, { name, buffer }) => {
      const file = new File([new Uint8Array(buffer)], name, { type: 'text/csv' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      const event = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      });
      element.dispatchEvent(event);
    }, { name: 'test-data.csv', buffer: Array.from(buffer) });

    await page.locator('[data-testid="upload-button"]').click();

    await expect(page.locator('text=アップロード完了')).toBeVisible();
  });
});