import { test, expect } from '@playwright/test';
import { login, ADMIN_CREDENTIALS } from '../utils/auth';

test.describe('Admin Documents CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
        await page.goto('/_/admin/documents');
    });

    test('should manage documents', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Documents');

        // Create (ignoring actual file upload for now as it needs Vercel Blob mock/real upload)
        // We'll just check if the form opens and fields exist
        await page.waitForTimeout(2000);
        await page.click('button:has-text("Add Document")');

        const title = `Test Document ${Date.now()}`;
        await page.fill('input[name="title"]', title);
        await page.fill('textarea[name="description"]', 'Test document description');

        await expect(page.locator('input[type="file"]')).toBeVisible();
    });
});
