import { test, expect } from '@playwright/test';
import { login, ADMIN_CREDENTIALS } from '../utils/auth';

test.describe('Admin Blog CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
        await page.goto('/_/admin/blog');
    });

    test('should create a new blog post', async ({ page }) => {
        const postTitle = `Test Post ${Date.now()}`;

        await page.click('a:has-text("Create New")');
        await expect(page).toHaveURL(/\/_\/admin\/blog\/new/);

        await page.fill('input[name="title"]', postTitle);

        // Slug is auto-generated, wait for it to be filled
        await expect(page.locator('input[name="slug"]')).not.toHaveValue('');

        // Handling status select if it exists
        const publishToggle = page.locator('input[name="isPublished"]');
        if (await publishToggle.isVisible()) {
            // Keep it published for testing visibility
            await publishToggle.setChecked(true);
        }

        // Tiptap/Editor handler - just ensure it exists
        await expect(page.locator('.ProseMirror')).toBeVisible();

        await page.click('button:has-text("Save Post")');

        await expect(page).toHaveURL(/\/_\/admin\/blog/);
        await expect(page.locator('table')).toContainText(postTitle);
    });

    test('should search for a blog post', async ({ page }) => {
        // Wait for table
        await expect(page.locator('table')).toBeVisible();

        const firstRowTitle = await page.locator('table tbody tr').first().locator('td').first().innerText();

        await page.fill('input[placeholder="Search posts..."]', firstRowTitle);
        // Wait for debounce/navigation
        await page.waitForTimeout(1000);

        const rowCount = await page.locator('table tbody tr').count();
        expect(rowCount).toBeGreaterThan(0);
        await expect(page.locator('table tbody')).toContainText(firstRowTitle);
    });
});
