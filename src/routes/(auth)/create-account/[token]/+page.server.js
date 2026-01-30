import { AuthService } from '$lib/server/services/AuthService';
import { fail, error } from '@sveltejs/kit';

export async function load({ params }) {
    const { token } = params;
    const authService = new AuthService();

    try {
        await authService.validateInvite(token);
    } catch (e) {
        throw error(404, e.message);
    }

    return {};
}

export const actions = {
    default: async ({ request, params, cookies }) => {
        const { token } = params;
        const formData = await request.formData();
        const username = formData.get('username');
        const password = formData.get('password');

        if (typeof username !== 'string' || username.length < 3 || username.length > 31) {
            return fail(400, { message: 'Username must be between 3 and 31 characters.' });
        }
        if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
            return fail(400, { message: 'Password must be between 6 and 255 characters.' });
        }

        const authService = new AuthService();

        try {
            const { cookie } = await authService.completeInvite(token, username, password);

            cookies.set(cookie.name, cookie.value, {
                path: '.',
                ...cookie.attributes
            });

        } catch (err) {
            // Check for specific usage errors re-thrown by service
            return fail(400, { data: { username }, message: err.message });
        }

        // Instead of throwing a redirect, we return a specific success type
        // that the client-side `enhance` function can handle.
        return { type: 'redirect', location: '/_/admin' };
    }
};
