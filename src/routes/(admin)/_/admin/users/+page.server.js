import { fail } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';
import { UserService } from '$lib/server/services/UserService';
import { AuthService } from '$lib/server/services/AuthService';
import { sendInviteEmail } from '$lib/server/email.js';

const userService = new UserService();
const authService = new AuthService();
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
    },

    resendInvite: async ({ request, locals }) => {
        const formData = await request.formData();
        const email = String(formData.get('email'));
        const role = String(formData.get('role') || 'content_editor');

        if (locals.user.role !== 'admin') return fail(403, { message: 'Only Admins can resend invites.' });

        try {
            const invite = await authService.resendInvite(email, role, locals.user.id);
            const inviteLink = `${new URL(request.url).origin}/create-account/${invite.token}`;
            await sendInviteEmail(email, inviteLink);

            await log(locals.user.id, 'resend_invite', { email, role });

            return { success: true, action: 'resendInvite', message: `Invite re-sent to ${email}` };
        } catch (e) {
            console.error('Resend invite error:', e);
            return fail(500, { message: 'Failed to resend invite.' });
        }
    },

    sendResetLink: async ({ request, locals }) => {
        const formData = await request.formData();
        const email = String(formData.get('email'));
        const userId = String(formData.get('userId'));

        if (locals.user.role !== 'admin') return fail(403, { message: 'Only Admins can send reset links.' });

        try {
            const origin = new URL(request.url).origin;
            await authService.requestPasswordReset(email, origin);

            await log(locals.user.id, 'send_reset_link', { targetId: userId, email });

            return { success: true, action: 'sendResetLink', message: `Password reset link sent to ${email}` };
        } catch (e) {
            console.error('Send reset link error:', e);
            return fail(500, { message: 'Failed to send reset link.' });
        }
    }
};