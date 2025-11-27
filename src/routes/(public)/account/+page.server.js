import { db } from '$lib/server/db';
import { userTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog';

export const actions = {
    updateProfile: async ({ request, locals }) => {
        if (!locals.user) return fail(401);

        const formData = await request.formData();
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const email = formData.get('email');

        if (!email) return fail(400, { message: 'Email is required' });

        try {
            await db.update(userTable)
                .set({ 
                    firstName: String(firstName),
                    lastName: String(lastName),
                    email: String(email)
                })
                .where(eq(userTable.id, locals.user.id));

            await log(locals.user.id, 'update_profile', { data: { email } });

            return { success: true };
        } catch (error) {
            console.error('Profile update error:', error);
            if (error.code === '23505') { // Postgres unique constraint violation
                return fail(400, { message: 'Email already in use.' });
            }
            return fail(500, { message: 'Could not update profile.' });
        }
    }
};