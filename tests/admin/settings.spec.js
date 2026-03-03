import { test, expect } from '@playwright/test';
import { login, ADMIN_CREDENTIALS } from '../utils/auth.js';

test.describe('Admin Info & Settings', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
    });

    test('Page Content settings', async ({ page }) => {
        await page.goto('/_/admin/page-content');
        await expect(page.locator('h1, h2, h3').first()).toContainText(/Page Content|Pages/i);
    });

    test('Site Settings', async ({ page }) => {
        await page.goto('/_/admin/settings');
        await expect(page.locator('h1, h2, h3').first()).toContainText(/Settings/i);
    });

    test('Media Library', async ({ page }) => {
        await page.goto('/_/admin/media');
        await expect(page.locator('h1, h2, h3').first()).toContainText(/Media/i);
    });
});
