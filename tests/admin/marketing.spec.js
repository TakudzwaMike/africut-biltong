import { test, expect } from '@playwright/test';
import { login, ADMIN_CREDENTIALS } from '../utils/auth.js';

test.describe('Admin Marketing Module', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
    });

    test('Marketing campaigns listing', async ({ page }) => {
        await page.goto('/_/admin/marketing');
        await expect(page.locator('h1')).toContainText(/Marketing/i);
    });

    test('Promo Codes listing', async ({ page }) => {
        await page.goto('/_/admin/marketing');
        await page.click('button:has-text("Discount Codes")');
        await expect(page.locator('th').filter({ hasText: 'Code' }).first()).toBeVisible();
    });
});
