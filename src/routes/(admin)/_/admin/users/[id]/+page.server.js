import { UserService } from '$lib/server/services/UserService';
import { MediaRepository } from '$lib/server/repositories/MediaRepository';
import { log } from '$lib/server/auditLog.js';
import { fail, error, redirect } from '@sveltejs/kit';

export async function load({ params, locals }) {
    if (locals.user?.role !== 'admin') {
        throw redirect(303, '/_/admin/users');
    }

    const userService = new UserService();
    const targetUser = await userService.getUserById(params.id);

    if (!targetUser) {
        throw error(404, 'User not found');
    }

    let profileMedia = null;
    if (targetUser.profileImageId) {
        const mediaRepo = new MediaRepository();
        profileMedia = await mediaRepo.findById(targetUser.profileImageId);
    }

    return {
        targetUser,
        profileMedia
    };
}

export const actions = {
    updateProfile: async ({ request, locals, params }) => {
        if (locals.user?.role !== 'admin') return fail(403, { message: 'Only Admins can edit users.' });

        const formData = await request.formData();
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const email = formData.get('email');
        const role = formData.get('role');
        const profileImage = formData.get('profileImage');

        if (!email) return fail(400, { message: 'Email is required' });

        const targetUserId = params.id;

        /** @type {{ firstName: string, lastName: string, email: string, role: string, profileImageId?: number }} */
        const updateData = {
            firstName: String(firstName),
            lastName: String(lastName),
            email: String(email),
            role: String(role)
        };

        // Handle image upload if provided
        if (profileImage && profileImage instanceof File && profileImage.size > 0) {
            const mediaRepo = new MediaRepository();
            /** @type {any} */
            const results = await mediaRepo.uploadFiles([profileImage], locals);
            const result = results[0];

            if (result.status === 'fulfilled' && result.value?.media?.id) {
                updateData.profileImageId = result.value.media.id;
            } else if (result.status === 'rejected' || (result.status === 'fulfilled' && result.value?.status === 'rejected')) {
                console.error('Image upload failed', result);
                return fail(400, { message: 'Failed to upload profile image.' });
            }
        }

        try {
            const userService = new UserService();
            await userService.updateUserProfile(targetUserId, updateData);
            await log(locals.user.id, 'update_user_profile', { targetId: targetUserId, data: updateData });

            return { success: true };
        } catch (e) {
            const err = /** @type {Error} */ (e);
            console.error('Admin Profile update error:', err);
            if (err.message && err.message.includes('Email already')) {
                return fail(400, { message: 'Email already in use.' });
            }
            return fail(500, { message: 'Could not update profile.' });
        }
    }
};
