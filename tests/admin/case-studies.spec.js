import { test, expect } from '@playwright/test';
import { login, ADMIN_CREDENTIALS } from '../utils/auth';

test.describe('Admin Case Studies CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
        await page.goto('/_/admin/case-studies');
    });

    test('should manage case studies', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Case Studies');

        // Create
        await page.getByRole('link', { name: '+ Create New' }).click();
        await expect(page).toHaveURL(/\/_\/admin\/case-studies\/new/);

        const title = `Test Case Study ${Date.now()}`;
        await page.fill('input[name="title"]', title);

        // Slug is auto-generated
        await expect(page.locator('input[name="slug"]')).not.toHaveValue('');

        // Challenge and Solution (RichTextEditor)
        const editors = page.locator('.ProseMirror');
        await expect(editors).toHaveCount(2);
        await editors.first().fill('Test challenge content');
        await editors.last().fill('Test solution content');

        await page.click('button:has-text("Create Case Study")');

        await expect(page).toHaveURL(/\/_\/admin\/case-studies/);
        await expect(page.getByText(title)).toBeVisible();
    });
});
