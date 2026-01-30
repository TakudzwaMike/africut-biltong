import { UserService } from '$lib/server/services/UserService';
import { fail } from '@sveltejs/kit';

export const actions = {
    updateProfile: async ({ request, locals }) => {
        if (!locals.user) return fail(401);

        const formData = await request.formData();
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const email = formData.get('email');

        if (!email) return fail(400, { message: 'Email is required' });

        try {
            const userService = new UserService();
            await userService.updateUserProfile(locals.user.id, {
                firstName: String(firstName),
                lastName: String(lastName),
                email: String(email)
            });

            return { success: true };
        } catch (error) {
            console.error('Profile update error:', error);
            if (error.message && error.message.includes('Email already')) {
                return fail(400, { message: 'Email already in use.' });
            }
            return fail(500, { message: 'Could not update profile.' });
        }
    }
};