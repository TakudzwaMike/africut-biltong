import { test, expect } from '@playwright/test';
import { login, ADMIN_CREDENTIALS } from '../utils/auth';

test.describe('Admin Tracked Links CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
        await page.goto('/_/admin/tracked-links');
    });

    test('should manage tracked links', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Tracked Links');

        const desc = `Test Link ${Date.now()}`;
        await page.fill('input[name="destinationUrl"]', 'https://vision-ai.tech/test');
        await page.fill('input[name="description"]', desc);

        await page.click('button:has-text("Generate Link")');
        await expect(page.getByText('Tracked link created successfully.')).toBeVisible();
        await expect(page.locator('table')).toContainText(desc);
    });
});
