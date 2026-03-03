import { test, expect } from '@playwright/test';
import { login, ADMIN_CREDENTIALS } from '../utils/auth';

test.describe('Admin Suppliers CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
        await page.goto('/_/admin/suppliers');
    });

    test('should manage suppliers', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Suppliers');

        // Create
        await page.click('a:has-text("New Supplier")');
        await expect(page).toHaveURL(/\/_\/admin\/suppliers\/new/);

        const supplierName = `Test Supplier ${Date.now()}`;
        await page.fill('input[name="name"]', supplierName);
        await page.fill('input[name="contactEmail"]', 'test@supplier.com');
        await page.selectOption('select[name="currency"]', 'USD');

        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/\/_\/admin\/suppliers/);
        await expect(page.locator('table')).toContainText(supplierName);
    });
});
