import { db } from '$lib/server/db';
import { userTable, userInvite } from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { desc, eq, ne } from 'drizzle-orm';
import { log } from '$lib/server/auditLog.js';
import { Argon2id } from 'oslo/password';
import { generateId } from 'lucia';
import crypto from 'crypto';

export async function load({ locals }) {
	// Load all users EXCEPT the currently logged-in one for safety
	const users = await db.query.userTable.findMany({
		where: ne(userTable.id, locals.user.id),
		orderBy: desc(userTable.username),
		columns: {
			id: true,
			username: true
		}
	});
	return { users };
}

export const actions = {
	create: async ({ request, locals }) => {
		const formData = await request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (typeof username !== 'string' || username.length < 3 || username.length > 31) {
			return fail(400, { message: 'Username must be between 3 and 31 characters.' });
		}
		if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
			return fail(400, { message: 'Password must be between 6 and 255 characters.' });
		}

		try {
			const userId = generateId(15);
			const passwordHash = await new Argon2id().hash(password);

			const newUser = {
				id: userId,
				username,
				passwordHash
			};
			await db.insert(userTable).values(newUser);

			await log(locals.user?.id, 'create_user', { targetId: userId, data: { username } });

			return { success: true, message: 'User created successfully.' };
		} catch (error) {
			console.error('Error creating user:', error);
			if (error.code === '23505') {
				// Drizzle wraps postgres errors, but the code is often available
				return fail(400, { message: 'Username is already taken.' });
			}
			return fail(500, { message: 'Could not create user.' });
		}
	},

	delete: async ({ url, locals }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Invalid request' });
		}
		if (id === locals.user.id) {
			return fail(403, { message: 'You cannot delete your own account.' });
		}

		try {
			const userToDelete = await db.query.userTable.findFirst({ where: eq(userTable.id, id) });
			if (!userToDelete) {
				return fail(404, { message: 'User not found.' });
			}

			await db.delete(userTable).where(eq(userTable.id, id));

			await log(locals.user?.id, 'delete_user', {
				targetId: id,
				data: { username: userToDelete.username }
			});

			return { success: true, message: 'User deleted successfully.' };
		} catch (error) {
			console.error('Error deleting user:', error);
			return fail(500, { message: 'Could not delete user.' });
		}
	},
	
	generateInvite: async ({ locals }) => {
		try {
			const token = crypto.randomBytes(32).toString('hex');
			const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days from now

			const [newInvite] = await db
				.insert(userInvite)
				.values({
					token,
					expiresAt,
					createdBy: locals.user.id
				})
				.returning();

			await log(locals.user?.id, 'generate_user_invite', {
				targetId: newInvite.id,
				data: { token: 'REDACTED' }
			});
			
			return { success: true, token };
		} catch (error) {
			console.error('Error generating invite link:', error);
			return fail(500, { message: 'Could not generate invite link.' });
		}
	}
};