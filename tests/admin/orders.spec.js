import { test, expect } from '@playwright/test';
import { login, ADMIN_CREDENTIALS } from '../utils/auth.js';

test.describe('Admin Orders Module', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
    });

    test('Orders listing page loads', async ({ page }) => {
        await page.goto('/_/admin/orders');
        await expect(page.locator('h1.font-bold')).toContainText(/Orders/i);
    });
});
