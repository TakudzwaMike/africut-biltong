import { test, expect } from '@playwright/test';
import { login, ADMIN_CREDENTIALS } from '../utils/auth';

test.describe('Admin Audit Log', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
        await page.goto('/_/admin/audit-log');
    });

    test('should view audit logs', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Audit Log');
        await expect(page.locator('table')).toBeVisible();

        // Check if entries exist
        const rows = page.locator('table tbody tr');
        await expect(rows.count()).resolves.toBeGreaterThan(0);
    });
});
