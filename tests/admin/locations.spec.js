import { test, expect } from '@playwright/test';
import { login, ADMIN_CREDENTIALS } from '../utils/auth.js';

test.describe('Admin Locations Module', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
    });

    test('Locations listing and creation', async ({ page }) => {
        await page.goto('/_/admin/locations');
        await expect(page.locator('h1')).toContainText(/Locations/i);

        // Click create new
        await page.waitForTimeout(1000);
        await page.getByRole('button', { name: /\+ Create New/i }).click();

        // Fill out modal/form
        await page.fill('input[name="countryName"]', 'Test Country');
        await page.fill('input[name="countryCode"]', 'TC');
        await page.fill('textarea[name="address"]', 'Test Address 123');

        await page.click('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Create")');

        // Wait for it to appear
        await expect(page.locator('table').first()).toContainText('Test Country');
    });
});
