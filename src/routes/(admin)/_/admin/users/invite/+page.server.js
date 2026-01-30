import { AuthService } from '$lib/server/services/AuthService';
import { fail, redirect } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';

export async function load({ locals }) {
    if (locals.user.role !== 'admin') {
        throw redirect(302, '/_/admin');
    }
    return {};
}

export const actions = {
    default: async ({ request, locals }) => {
        const formData = await request.formData();
        const email = String(formData.get('email'));
        const role = String(formData.get('role'));

        if (!email || !email.includes('@')) {
            return fail(400, { message: 'Invalid email address.' });
        }

        const authService = new AuthService();

        try {
            const invite = await authService.createInvite(email, role, locals.user.id);

            // Log the action
            await log(locals.user.id, 'create_invite', {
                email,
                role,
                inviteId: invite.id
            });

            // In a real app, we'd send an email here.
            // For now, we'll return the invite link so the admin can copy it.
            const inviteLink = `${new URL(request.url).origin}/create-account/${invite.token}`;

            return {
                success: true,
                inviteLink,
                message: `Invite created for ${email}.`
            };
        } catch (e) {
            console.error('Invite error:', e);
            return fail(500, { message: 'Failed to create invite.' });
        }
    }
};
