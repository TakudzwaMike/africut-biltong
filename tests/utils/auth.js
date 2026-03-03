/**
 * Shared authentication utility for Playwright tests.
 */
export async function login(page, email, password) {
    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Default wait for admin dashboard or account page
    await page.waitForURL(url =>
        url.pathname.startsWith('/_/admin') ||
        url.pathname.startsWith('/account')
    );
}

export const ADMIN_CREDENTIALS = {
    email: 'admin@vision-ai.tech',
    password: 'password123'
};

export const MANAGER_CREDENTIALS = {
    email: 'manager@vision-ai.tech',
    password: 'password123'
};

export const EDITOR_CREDENTIALS = {
    email: 'editor@vision-ai.tech',
    password: 'password123'
};
