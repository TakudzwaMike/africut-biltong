import { UserService } from '$lib/server/services/UserService';
import { redirect, fail } from '@sveltejs/kit';

export async function load({ locals }) {
    if (!locals.user) throw redirect(303, '/login');

    const userService = new UserService();
    const addresses = await userService.getUserAddresses(locals.user.id);

    return { addresses };
}

export const actions = {
    save: async ({ request, locals }) => {
        if (!locals.user) return fail(401);

        const formData = await request.formData();
        const id = formData.get('id');
        const isDefault = formData.get('isDefault') === 'on';

        const data = {
            label: String(formData.get('label')),
            firstName: String(formData.get('firstName')),
            lastName: String(formData.get('lastName')),
            address: String(formData.get('address')),
            city: String(formData.get('city')),
            state: String(formData.get('state')),
            zipCode: String(formData.get('zipCode')),
            country: String(formData.get('country')),
            isDefault: isDefault
        };

        try {
            const userService = new UserService();
            if (id) {
                await userService.updateUserAddress(locals.user.id, String(id), data);
            } else {
                await userService.createUserAddress(locals.user.id, data);
            }

            return { success: true };

        } catch (error) {
            console.error('Address save error:', error);
            return fail(500, { message: 'Failed to save address' });
        }
    },

    delete: async ({ request, locals }) => {
        if (!locals.user) return fail(401);

        const formData = await request.formData();
        const id = String(formData.get('id'));

        try {
            const userService = new UserService();
            await userService.deleteUserAddress(locals.user.id, id);
            return { success: true };
        } catch (error) {
            return fail(500, { message: 'Failed to delete address' });
        }
    }
};