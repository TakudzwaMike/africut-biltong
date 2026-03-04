import { test, expect } from '@playwright/test';
import { login, ADMIN_CREDENTIALS } from '../utils/auth';

test.describe('Admin Tracked Links CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
        await page.goto('/_/admin/tracked-links');
    });

    test('should manage tracked links', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Tracked Links');

        const uniqueId = Date.now().toString().slice(-6);
        const desc = `Test Link ${uniqueId}`;
        await page.fill('input[name="destinationUrl"]', `https://vision-ai.tech/test-${uniqueId}`);
        await page.fill('input[name="description"]', desc);

        await page.click('button:has-text("Generate Link")');
        // Wait for the form submission and any navigation to complete
        await page.waitForLoadState('networkidle');
        // Verify the link appears in the table (works for both enhanced and non-enhanced form)
        await expect(page.locator('table')).toContainText(desc, { timeout: 10000 });
    });
});
