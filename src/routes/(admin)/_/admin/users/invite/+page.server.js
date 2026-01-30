import { AuthService } from '$lib/server/services/AuthService';
import { fail, redirect } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';
import { sendInviteEmail } from '$lib/server/email.js';

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

            const inviteLink = `${new URL(request.url).origin}/create-account/${invite.token}`;

            // Send automated email
            const emailSent = await sendInviteEmail(email, inviteLink);

            return {
                success: true,
                inviteLink,
                emailSent,
                message: emailSent
                    ? `Invite created and sent successfully to ${email}.`
                    : `Invite created for ${email}, but the email failed to send. You can still share the link manually.`
            };
        } catch (e) {
            console.error('Invite error:', e);
            return fail(500, { message: 'Failed to create invite.' });
        }
    }
};
