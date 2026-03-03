import { fail } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';
import { UserService } from '$lib/server/services/UserService';

const userService = new UserService();
const ITEMS_PER_PAGE = 20;

export async function load({ url, locals }) {
    const query = url.searchParams.get('q') || '';
    const view = url.searchParams.get('view') || 'all';
    const page = Number(url.searchParams.get('page')) || 1;

    const { users, totalItems, totalPages } = await userService.listUsers({
        page,
        limit: ITEMS_PER_PAGE,
        query,
        view,
        currentUserId: locals.user.id
    });

    return {
        users,
        pagination: {
            page,
            totalPages,
            totalItems,
            query,
            view
        }
    };
}

export const actions = {
    updateRole: async ({ request, locals }) => {
        const formData = await request.formData();
        const userId = String(formData.get('id'));
        const newRole = String(formData.get('role'));

        if (locals.user.role !== 'admin') return fail(403, { message: 'Only Admins can change roles.' });

        try {
            await userService.updateUserRole(locals.user.id, userId, newRole);

            await log(locals.user.id, 'update_user_role', {
                targetId: userId,
                data: { role: newRole }
            });

            return { success: true };
        } catch (e) {
            // Check if e is SvelteKit error
            if (e.status === 400 || e.status === 403) return fail(e.status, { message: e.body.message });
            return fail(500, { message: 'Failed to update role' });
        }
    },

    delete: async ({ request, locals }) => {
        const formData = await request.formData();
        const userId = String(formData.get('id'));

        if (locals.user.role !== 'admin') return fail(403, { message: 'Only Admins can delete users.' });

        try {
            await userService.deleteUser(locals.user.id, userId);

            await log(locals.user.id, 'delete_user', { targetId: userId });

            return { success: true };
        } catch (e) {
            if (e.status === 400) return fail(e.status, { message: e.body.message });
            return fail(500, { message: 'Failed to delete user' });
        }
    }
};