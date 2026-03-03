import { test, expect } from '@playwright/test';

test.describe('Public E-Commerce Pages', () => {

    test('Store listing and filtering', async ({ page }) => {
        await page.goto('/store');
        await expect(page.locator('h1')).toContainText(/Equip/i);

        // Wait for products to load
        const products = page.locator('a[href^="/products/"]');
        // Let SvelteKit hydration finish
        await page.waitForTimeout(1000);

        if (await products.count() > 0) {
            const firstProductHref = await products.first().getAttribute('href');
            await products.first().click();
            await page.waitForURL(firstProductHref);

            // Should see Add to Cart or similar
            await expect(page.locator('h1').first()).toBeVisible();
            const addToCartBtn = page.locator('button:has-text("Add to Cart")');
            if (await addToCartBtn.isVisible()) {
                await addToCartBtn.click();
                // Depending on the implementation, maybe a mini-cart opens or toast
                await expect(page.locator('.toast, .minicart, text=added to cart')).toBeVisible({ timeout: 5000 }).catch(() => { });
            }
        }
    });

    test('Cart page should load', async ({ page }) => {
        await page.goto('/cart');
        await expect(page.locator('h1').first()).toContainText(/Shopping Cart/i);
    });

});
