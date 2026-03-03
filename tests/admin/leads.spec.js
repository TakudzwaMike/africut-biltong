import { test, expect } from '@playwright/test';
import { login, ADMIN_CREDENTIALS } from '../utils/auth';

test.describe('Admin Leads', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
        await page.goto('/_/admin/leads');
    });

    test('should view leads', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Leads');
        await expect(page.locator('table')).toBeVisible();

        // Check if export button exists
        await expect(page.locator('a:has-text("Export CSV")')).toBeVisible();
    });
});
