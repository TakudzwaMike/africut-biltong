import { AuthService } from '$lib/server/services/AuthService';
import { PasswordResetRepository } from '$lib/server/repositories/PasswordResetRepository';
import { fail, redirect } from '@sveltejs/kit';

const resetRepo = new PasswordResetRepository();

export async function load({ params }) {
    const token = await resetRepo.findValidToken(params.token);

    if (!token) {
        return { invalid: true };
    }

    return { invalid: false, token: params.token };
}

export const actions = {
    default: async ({ request, params }) => {
        const formData = await request.formData();
        const password = String(formData.get('password'));
        const confirmPassword = String(formData.get('confirmPassword'));

        if (!password || password.length < 8) {
            return fail(400, { message: 'Password must be at least 8 characters.' });
        }

        if (password !== confirmPassword) {
            return fail(400, { message: 'Passwords do not match.' });
        }

        const authService = new AuthService();

        try {
            await authService.resetPassword(params.token, password);
        } catch (e) {
            return fail(400, { message: e.message || 'Failed to reset password.' });
        }

        throw redirect(302, '/login?reset=success');
    }
};
