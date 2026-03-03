import { test, expect } from '@playwright/test';
import { login, ADMIN_CREDENTIALS } from '../utils/auth';

test.describe('Admin Partners CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
        await page.goto('/_/admin/partners');
    });

    test('should manage partners', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Partners');

        // Create
        await page.waitForTimeout(2000);
        await page.getByRole('button', { name: /Create New/i }).click();

        const name = `Test Partner ${Date.now()}`;
        await page.fill('input[name="name"]', name);

        await page.click('button:has-text("Save Partner")');

        await expect(page.locator('table')).toContainText(name);
    });
});
