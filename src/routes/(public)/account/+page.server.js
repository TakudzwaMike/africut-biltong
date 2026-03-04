import { UserService } from '$lib/server/services/UserService';
import { MediaRepository } from '$lib/server/repositories/MediaRepository';
import { fail } from '@sveltejs/kit';

export async function load({ locals }) {
    let profileMedia = null;
    if (locals.user?.profileImageId) {
        const mediaRepo = new MediaRepository();
        profileMedia = await mediaRepo.findById(locals.user.profileImageId);
    }
    return { profileMedia };
}

export const actions = {
    updateProfile: async ({ request, locals }) => {
        if (!locals.user) return fail(401);

        const formData = await request.formData();
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const email = formData.get('email');
        const profileImage = formData.get('profileImage');

        if (!email) return fail(400, { message: 'Email is required' });

        /** @type {{ firstName: string, lastName: string, email: string, profileImageId?: number }} */
        const updateData = {
            firstName: String(firstName),
            lastName: String(lastName),
            email: String(email)
        };

        // Handle image upload if provided
        if (profileImage && profileImage instanceof File && profileImage.size > 0) {
            const mediaRepo = new MediaRepository();
            /** @type {any} */
            const results = await mediaRepo.uploadFiles([profileImage], locals);

            // uploadFiles returns an array of Settled results (or directly if not using Promise.allSettled)
            // Wait, looking at MediaRepository, it returns: `const results = await Promise.allSettled(uploadPromises); return results;`
            const result = results[0];

            if (result.status === 'fulfilled' && result.value?.media?.id) {
                updateData.profileImageId = result.value.media.id;
            } else if (result.status === 'rejected' || (result.status === 'fulfilled' && result.value?.status === 'rejected')) {
                // Return descriptive error from upload logic
                console.error('Image upload failed', result);
                return fail(400, { message: 'Failed to upload profile image.' });
            }
        }

        try {
            const userService = new UserService();
            await userService.updateUserProfile(locals.user.id, updateData);

            return { success: true };
        } catch (e) {
            const error = /** @type {Error} */ (e);
            console.error('Profile update error:', error);
            if (error.message && error.message.includes('Email already')) {
                return fail(400, { message: 'Email already in use.' });
            }
            return fail(500, { message: 'Could not update profile.' });
        }
    }
};