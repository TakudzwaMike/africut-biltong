import { AuthService } from '$lib/server/services/AuthService';
import { fail, redirect } from '@sveltejs/kit';

const STAFF_ROLES = ['admin', 'store_manager', 'content_editor'];

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

            // If there is a specific redirect intent (e.g. they tried to go to /_/admin/products), respect it
            if (redirectTo) {
                throw redirect(303, redirectTo);
            }

            // Otherwise, default routing based on role
            if (user && STAFF_ROLES.includes(user.role)) {
                throw redirect(303, '/_/admin');
            } else {
                throw redirect(303, '/account');
            }

        } catch (error) {
            if (error.status === 303) throw error; // Re-throw redirects
            return fail(400, { message: error.message });
        }
    }
};
