import { AuthService } from '$lib/server/services/AuthService';
import { fail } from '@sveltejs/kit';

export const actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const email = String(formData.get('email')).trim().toLowerCase();

        if (!email || !email.includes('@')) {
            return fail(400, { message: 'Please enter a valid email address.' });
        }

        const authService = new AuthService();

        try {
            const origin = new URL(request.url).origin;
            await authService.requestPasswordReset(email, origin);
        } catch (e) {
            // Log but don't expose to user
            console.error('Password reset error:', e);
        }

        // Always show success (don't reveal if email exists)
        return { success: true };
    }
};
