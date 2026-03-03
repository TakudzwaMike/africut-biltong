import { test, expect } from '@playwright/test';
import { login, MANAGER_CREDENTIALS, EDITOR_CREDENTIALS } from '../utils/auth';

test.describe('Admin Roles and Permissions', () => {

    test.describe('Store Manager', () => {
        test.beforeEach(async ({ page }) => {
            await login(page, MANAGER_CREDENTIALS.email, MANAGER_CREDENTIALS.password);
        });

        test('should have access to Commerce modules', async ({ page }) => {
            await page.goto('/_/admin/products');
            await expect(page.locator('h1')).toContainText('Products');

            await page.goto('/_/admin/orders');
            await expect(page.locator('h1')).toContainText('Orders');
        });

        test('should be denied access to System and Content settings', async ({ page }) => {
            // Attempt to access Users
            const response = await page.goto('/_/admin/users');
            // Assuming the system redirects or returns 403. Our auth check redirects to dashboard or login
            // For Vision AI, unathorized admin routes currently redirect to /_/admin if logged in, or show SvelteKit error.
            // Let's check for the redirect or an error message.
            if (response.status() === 200) {
                await expect(page.url()).not.toContain('/users');
            } else {
                expect(response.status()).toBe(403);
            }

            // Attempt to access Blog
            const blogRes = await page.goto('/_/admin/blog');
            if (blogRes.status() === 200) {
                await expect(page.url()).not.toContain('/blog');
            } else {
                expect(blogRes.status()).toBe(403);
            }
        });

        test('sidebar should not show unauthorized links', async ({ page }) => {
            await page.goto('/_/admin');
            const sidebar = page.locator('nav');
            await expect(sidebar).toBeVisible();
            await expect(sidebar.locator('a:has-text("Products")')).toBeVisible();
            // Should not see Users or Audit Log
            await expect(sidebar.locator('a:has-text("Users & Staff")')).not.toBeVisible();
            await expect(sidebar.locator('a:has-text("Audit Log")')).not.toBeVisible();
            await expect(sidebar.locator('a:has-text("Blog Posts")')).not.toBeVisible();
        });
    });

    test.describe('Content Editor', () => {
        test.beforeEach(async ({ page }) => {
            await login(page, EDITOR_CREDENTIALS.email, EDITOR_CREDENTIALS.password);
        });

        test('should have access to Content modules', async ({ page }) => {
            await page.goto('/_/admin/blog');
            await expect(page.locator('h1')).toContainText('Blog Posts');

            await page.goto('/_/admin/case-studies');
            await expect(page.locator('h1')).toContainText('Case Studies');
        });

        test('should be denied access to Commerce and System settings', async ({ page }) => {
            // Attempt to access Products
            const resProd = await page.goto('/_/admin/products');
            if (resProd.status() === 200) {
                await expect(page.url()).not.toContain('/products');
            } else {
                expect(resProd.status()).toBe(403);
            }

            // Attempt to access Audit Log
            const resAudit = await page.goto('/_/admin/audit-log');
            if (resAudit.status() === 200) {
                await expect(page.url()).not.toContain('/audit-log');
            } else {
                expect(resAudit.status()).toBe(403);
            }
        });

        test('sidebar should not show unauthorized links', async ({ page }) => {
            await page.goto('/_/admin');
            const sidebar = page.locator('nav');
            await expect(sidebar).toBeVisible();
            await expect(sidebar.locator('a:has-text("Blog Posts")')).toBeVisible();
            await expect(sidebar.locator('a:has-text("Documents")')).toBeVisible();
            // Should not see Users or Products
            await expect(sidebar.locator('a:has-text("Users & Staff")')).not.toBeVisible();
            await expect(sidebar.locator('a:has-text("Products")')).not.toBeVisible();
        });
    });
});
