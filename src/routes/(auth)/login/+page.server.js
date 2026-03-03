import { AuthService } from '$lib/server/services/AuthService';
import { fail, redirect } from '@sveltejs/kit';

const STAFF_ROLES = ['admin', 'store_manager', 'content_editor'];
const ADMIN_EMAIL_DOMAIN = 'vision-ai.tech';

export const actions = {
    default: async (event) => {
        const formData = await event.request.formData();
        const email = formData.get('email');
        const password = formData.get('password');

        const authService = new AuthService();

        try {
            const { cookie, user } = await authService.login(email, password);

            event.cookies.set(cookie.name, cookie.value, {
                path: '.',
                ...cookie.attributes
            });

            // Redirect Logic
            const redirectTo = event.url.searchParams.get('redirectTo');

            // If there is a specific redirect intent to admin, verify domain
            if (redirectTo && redirectTo.startsWith('/_/admin')) {
                const userEmail = user?.email || '';
                if (user && STAFF_ROLES.includes(user.role) && userEmail.endsWith(`@${ADMIN_EMAIL_DOMAIN}`)) {
                    throw redirect(303, redirectTo);
                }
                // Staff without correct domain — redirect to account
                return fail(400, { message: 'Admin access is restricted to @vision-ai.tech email addresses.' });
            }

            if (redirectTo) {
                throw redirect(303, redirectTo);
            }

            // Default routing based on role + domain
            if (user && STAFF_ROLES.includes(user.role)) {
                const userEmail = user.email || '';
                if (userEmail.endsWith(`@${ADMIN_EMAIL_DOMAIN}`)) {
                    throw redirect(303, '/_/admin');
                }
            }

            throw redirect(303, '/account');

        } catch (error) {
            if (error.status === 303) throw error; // Re-throw redirects
            return fail(400, { message: error.message });
        }
    }
};
