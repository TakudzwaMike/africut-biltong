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

        // Wait for and click the tab using a more reliable locator
        const discountTab = page.getByRole('button', { name: 'Discount Codes' });
        await expect(discountTab).toBeVisible();
        await discountTab.click();

        // Wait for the specific header "Code" to appear, meaning the content has switched
        const codeHeader = page.locator('th').filter({ hasText: 'Code' }).first();
        await expect(codeHeader).toBeVisible({ timeout: 10000 });
    });
});
