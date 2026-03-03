import { test, expect } from '@playwright/test';
import { login, ADMIN_CREDENTIALS } from '../utils/auth';

test.describe('Admin Authentication & Layout', () => {
    test('should fail with incorrect credentials', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'wrong@example.com');
        await page.fill('input[name="password"]', 'wrongpass');
        await page.click('button[type="submit"]');

        await expect(page.getByText('Incorrect email or password')).toBeVisible();
    });

    test('should login as admin and see dashboard', async ({ page }) => {
        await login(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
        await expect(page).toHaveURL(/\/_\/admin/);
        await expect(page.locator('h1')).toContainText('Dashboard');
    });

    test('sidebar should be functional and highlight active links', async ({ page }) => {
        await login(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);

        // Navigate to Blog
        await page.click('nav a:has-text("Blog Posts")');
        await expect(page).toHaveURL(/\/_\/admin\/blog/);

        // Check highlighting
        const blogLink = page.locator('nav a:has-text("Blog Posts")');
        await expect(blogLink).toHaveClass(/bg-main/); // Active class
    });

    test('should show correct role badge', async ({ page }) => {
        await login(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
        const badge = page.locator('.flex.w-fit.items-center.gap-2.rounded-md.bg-purple-600');
        await expect(badge).toBeVisible();
        await expect(badge).toContainText('Admin');
    });
});
