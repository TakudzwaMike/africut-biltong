import { test, expect } from '@playwright/test';

test.describe('Admin Delete Functionality', () => {
    test.beforeEach(async ({ page }) => {
        // Login as Admin
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@vision-ai.tech');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Wait for redirect to admin
        await expect(page).toHaveURL(/\/_\/admin/);
    });

    test('should delete a solution', async ({ page }) => {
        await page.goto('/_/admin/solutions');

        // Wait for the table to load
        await expect(page.locator('table')).toBeVisible();

        // Wait a bit for Svelte to render items (important for hydration/DataTable)
        await page.waitForTimeout(2000);

        const rows = page.locator('table tbody tr');
        const rowCount = await rows.count();

        if (rowCount === 0) {
            console.log('No solutions to delete, skipping test logic');
            return;
        }

        // Capture the name of the first solution
        const firstSolutionName = await rows.first().locator('td').first().innerText();
        console.log(`Attempting to delete solution: ${firstSolutionName}`);

        // Click delete on the first row
        // Note: The form has action="?/delete&id=..."
        await rows.first().locator('button:has-text("Delete")').click();

        // Wait for success toast
        await expect(page.getByText('Solution deleted successfully!')).toBeVisible();

        // Verify row is gone
        await expect(page.locator(`table tbody tr:has-text("${firstSolutionName}")`)).not.toBeVisible();
    });

    test('should delete a blog post', async ({ page }) => {
        await page.goto('/_/admin/blog');

        await expect(page.locator('table')).toBeVisible();
        await page.waitForTimeout(2000);

        const rows = page.locator('table tbody tr');
        const rowCount = await rows.count();

        if (rowCount === 0) {
            console.log('No blog posts to delete, skipping test logic');
            return;
        }

        const firstPostTitle = await rows.first().locator('td').first().innerText();
        console.log(`Attempting to delete blog post: ${firstPostTitle}`);

        await rows.first().locator('button:has-text("Delete")').click();

        await expect(page.getByText('Blog post deleted successfully!')).toBeVisible();
        await expect(page.locator(`table tbody tr:has-text("${firstPostTitle}")`)).not.toBeVisible();
    });

    test('should delete a tracked link', async ({ page }) => {
        await page.goto('/_/admin/tracked-links');

        await expect(page.locator('table')).toBeVisible();
        await page.waitForTimeout(2000);

        const rows = page.locator('table tbody tr');
        const rowCount = await rows.count();

        if (rowCount === 0) {
            console.log('No tracked links to delete, skipping test logic');
            return;
        }

        // The tracked link page has a confirmation dialog (confirm('...'))
        page.on('dialog', dialog => dialog.accept());

        const firstLinkDesc = await rows.first().locator('td').first().locator('p').first().innerText();
        console.log(`Attempting to delete tracked link: ${firstLinkDesc}`);

        await rows.first().locator('button[aria-label="Delete link"]').click();

        await expect(page.getByText('Tracked link deleted successfully.')).toBeVisible();
        await expect(page.locator(`table tbody tr:has-text("${firstLinkDesc}")`)).not.toBeVisible();
    });
});
