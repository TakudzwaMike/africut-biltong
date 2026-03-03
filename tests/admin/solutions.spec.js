import { test, expect } from '@playwright/test';
import { login, ADMIN_CREDENTIALS } from '../utils/auth';

test.describe('Admin Solutions CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
        await page.goto('/_/admin/solutions');
    });

    test('should manage solutions', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Solutions');

        // Create
        await page.click('a:has-text("Create New")');
        await expect(page).toHaveURL(/\/_\/admin\/solutions\/new/);

        const solutionName = `Test Solution ${Date.now()}`;
        await page.fill('input[name="solutionName"]', solutionName);

        // Slug is auto-generated, wait for it
        await expect(page.locator('input[name="slug"]')).not.toHaveValue('');

        await page.fill('textarea[name="shortDescription"]', 'A breakthrough in antigravity technology.');

        // Content editor (ProseMirror)
        await expect(page.locator('.ProseMirror')).toBeVisible();

        await page.click('button:has-text("Create Solution")');

        await expect(page).toHaveURL(/\/_\/admin\/solutions/);
        await expect(page.locator('table')).toContainText(solutionName);
    });
});
