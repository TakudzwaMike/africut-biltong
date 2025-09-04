import { db } from '$lib/server/db';
import { userInvite, userTable } from '$lib/server/db/schema.js';
import { fail, error, redirect } from '@sveltejs/kit';
import { and, eq, isNull, gt } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';
import { generateId } from 'lucia';
import * as auth from '$lib/server/auth';

export async function load({ params }) {
	const { token } = params;

	const invite = await db.query.userInvite.findFirst({
		where: and(
			eq(userInvite.token, token),
			isNull(userInvite.usedAt), // Ensure it hasn't been used
			gt(userInvite.expiresAt, new Date()) // Ensure it's not expired
		)
	});

	if (!invite) {
		throw error(404, 'This invitation link is invalid or has expired.');
	}

	// We don't need to return anything, just confirm the page can load.
	return {};
}

export const actions = {
	default: async ({ request, params, cookies }) => {
		const { token } = params;
		const formData = await request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (typeof username !== 'string' || username.length < 3 || username.length > 31) {
			return fail(400, { message: 'Username must be between 3 and 31 characters.' });
		}
		if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
			return fail(400, { message: 'Password must be between 6 and 255 characters.' });
		}
		
		const invite = await db.query.userInvite.findFirst({
			where: and(
				eq(userInvite.token, token),
				isNull(userInvite.usedAt),
				gt(userInvite.expiresAt, new Date())
			)
		});

		if (!invite) {
			return fail(400, { message: 'This invitation link is invalid or has expired.' });
		}

		try {
			const userId = generateId(15);
			const passwordHash = await new Argon2id().hash(password);

			await db.transaction(async (tx) => {
				// Create the new user
				await tx.insert(userTable).values({
					id: userId,
					username,
					passwordHash
				});
				// Mark the invite as used
				await tx.update(userInvite).set({ usedAt: new Date() }).where(eq(userInvite.id, invite.id));
			});
			
			// Automatically log the new user in
			const session = await auth.createSession(userId);
			const sessionCookie = auth.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});

		} catch (error) {
			console.error('Error creating user from invite:', error);
			if (error.code === '23505') {
				return fail(400, { data: { username }, message: 'Username is already taken.' });
			}
			return fail(500, { data: { username }, message: 'Could not create your account.' });
		}

		// Instead of throwing a redirect, we return a specific success type
		// that the client-side `enhance` function can handle.
		return { type: 'redirect', location: '/admin' };
	}
};