import { test, expect } from '@playwright/test';

test.describe('Public Content Pages', () => {

    test('Homepage should load and display hero', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Vision AI/);
        // We know the hero has a carousel, check if the first image or some text is visible
        await expect(page.locator('h1').first()).toBeVisible();
    });

    test('Blog listing and single post navigation', async ({ page }) => {
        await page.goto('/blog');
        await expect(page.locator('h1')).toContainText(/Blog|Insights/i);

        // Ensure there are blog posts listed (if seeded)
        const articles = page.locator('article');
        if (await articles.count() > 0) {
            // Click the first article link
            const firstLink = articles.first().locator('a').first();
            const href = await firstLink.getAttribute('href');
            await firstLink.click();
            await page.waitForURL(href);
            // Verify single post layout
            await expect(page.locator('article h1')).toBeVisible();
        }
    });

    test('Solutions listing and single solution navigation', async ({ page }) => {
        await page.goto('/solutions');
        await expect(page.locator('h1')).toContainText(/Solutions/i);

        const cards = page.locator('a[href^="/solutions/"]');
        if (await cards.count() > 0) {
            const href = await cards.first().getAttribute('href');
            await cards.first().click();
            await page.waitForURL(href);
            await expect(page.locator('h1').first()).toBeVisible();
        }
    });

    test('Case Studies listing', async ({ page }) => {
        await page.goto('/case-studies');
        await expect(page.locator('h1').first()).toContainText(/Proven Results/i);
    });

    test('Contact page and Lead generation form', async ({ page }) => {
        test.setTimeout(60000);

        // Inject flag before loading the page so the PoW action sees it
        await page.addInitScript(() => {
            window.__PLAYWRIGHT_TEST__ = true;
        });

        await page.goto('/contact');
        await expect(page.locator('h1')).toContainText(/Start the Conversation/i);

        // Click to trigger focus (which now auto-resolves in test mode)
        await page.click('input[name="firstName"]');

        await page.fill('input[name="firstName"]', 'Test');
        await page.fill('input[name="lastName"]', 'User');
        await page.fill('input[name="email"]', 'testlead@example.com');
        await page.fill('textarea[name="message"]', 'This is a test message from Playwright.');

        await page.click('button[type="submit"]');

        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/contact-debug.png' });

        // Check for success message
        await expect(
            page.locator('text=Thank you').or(page.locator('.bg-green-50'))
        ).toBeVisible({ timeout: 10000 });
    });
});
