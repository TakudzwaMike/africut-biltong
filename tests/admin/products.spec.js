import { test, expect } from '@playwright/test';
import { login, ADMIN_CREDENTIALS } from '../utils/auth';

test.describe('Admin Products CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
        await page.goto('/_/admin/products');
    });

    test('should manage products', async ({ page }) => {
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
        await expect(page.locator('h1')).toContainText('Products');

        // Create
        // Wait for SvelteKit hydration
        await page.waitForTimeout(2000);
        await page.getByRole('button', { name: 'Create New' }).click();
        await page.waitForSelector('input[name="name"]');

        const productName = `Test Product ${Date.now()}`;
        await page.fill('input[name="name"]', productName);

        // Slug is auto-populated in Svelte (usually) or we fill it
        await page.fill('input[name="slug"]', productName.toLowerCase().replace(/\s+/g, '-'));

        await page.selectOption('select[name="type"]', 'physical');
        await page.fill('textarea[name="shortDescription"]', 'Test short description');

        // RichTextEditor
        const editor = page.locator('.ProseMirror');
        await editor.fill('Test long description content');

        await page.click('button:has-text("Save Product")');

        // Wait for the table to contain the new product
        await expect(page.locator('table')).toContainText(productName, { timeout: 10000 });
    });
});
