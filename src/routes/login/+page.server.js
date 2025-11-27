import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import { userTable } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

const STAFF_ROLES = ['admin', 'store_manager', 'content_editor'];

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		if (!email || !password) {
			return fail(400, { message: 'Email and password are required.' });
		}

		const existingUser = await db.query.userTable.findFirst({
			where: eq(userTable.email, String(email))
		});

		if (!existingUser) {
			return fail(400, { message: 'Incorrect email or password' });
		}

		const validPassword = await auth.verifyPassword(existingUser.passwordHash, String(password));
		if (!validPassword) {
			return fail(400, { message: 'Incorrect email or password' });
		}

		const session = await auth.createSession(existingUser.id);
		const sessionCookie = auth.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

        // Redirect Logic
        const redirectTo = event.url.searchParams.get('redirectTo');

        // If there is a specific redirect intent (e.g. they tried to go to /_/admin/products), respect it
        if (redirectTo) {
            throw redirect(303, redirectTo);
        }

        // Otherwise, default routing based on role
        if (STAFF_ROLES.includes(existingUser.role)) {
		    throw redirect(303, '/_/admin');
        } else {
            throw redirect(303, '/account');
        }
	}
};