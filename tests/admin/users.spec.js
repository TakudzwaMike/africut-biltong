import { test, expect } from '@playwright/test';
import { login, ADMIN_CREDENTIALS } from '../utils/auth';

test.describe('Admin Users', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
        await page.goto('/_/admin/users');
    });

    test('should view and manage users', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Users');
        await expect(page.locator('table')).toBeVisible();

        // Search
        await page.fill('input[placeholder="Search users..."]', 'admin');
        await page.waitForTimeout(500);

        // Check tabs
        await page.click('button:has-text("Staff")');
        await expect(page).toHaveURL(/view=staff/);
    });
});
