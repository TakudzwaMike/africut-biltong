import { test, expect } from '@playwright/test';
import { login, ADMIN_CREDENTIALS } from '../utils/auth';

test.describe('Admin Team Member CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
        await page.goto('/_/admin/team-members');
    });

    test('should manage team members', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Team Members');

        // Create
        await page.waitForTimeout(2000);
        await page.getByRole('button', { name: /Create New/i }).click();
        const name = `Test Member ${Date.now()}`;
        await page.fill('input[name="name"]', name);
        await page.fill('input[name="title"]', 'Visionary AI Researcher');
        await page.fill('textarea[name="bio"]', 'Experienced AI engineer with a passion for antigravity.');

        await page.click('button:has-text("Save Member")');

        await expect(page.getByText('Team member added.')).toBeVisible();
        await expect(page.locator('table')).toContainText(name);

        await expect(page.locator('table')).toContainText(name);
    });
});
