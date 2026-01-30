import { AuthService } from '$lib/server/services/AuthService';
import { fail, error, redirect } from '@sveltejs/kit';

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
        const username = String(formData.get('username') || '');
        const password = String(formData.get('password') || '');
        const firstName = String(formData.get('firstName') || '');
        const lastName = String(formData.get('lastName') || '');

        if (username.length < 3 || username.length > 31) {
            return fail(400, { message: 'Username must be between 3 and 31 characters.' });
        }
        if (password.length < 6 || password.length > 255) {
            return fail(400, { message: 'Password must be between 6 and 255 characters.' });
        }

        const authService = new AuthService();

        try {
            const { cookie } = await authService.completeInvite(token, username, password, firstName, lastName);

            cookies.set(cookie.name, cookie.value, {
                path: '/',
                ...cookie.attributes
            });

        } catch (err) {
            return fail(400, { data: { username, firstName, lastName }, message: err.message });
        }

        return redirect(302, '/_/admin');
    }
};
