import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { dev } from '$app/environment';
import { db } from '$lib/server/db';
import { sessionTable, userTable } from '$lib/server/db/schema';
import { Argon2id } from 'oslo/password';

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);

const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			id: attributes.id,
			username: attributes.username,
			email: attributes.email,
			role: attributes.role,
			firstName: attributes.firstName,
			lastName: attributes.lastName
		};
	}
});

export const sessionCookieName = lucia.sessionCookieName;

export async function createSession(userId) {
	return await lucia.createSession(userId, {});
}

export async function validateSession(sessionId) {
	return await lucia.validateSession(sessionId);
}

export async function invalidateSession(sessionId) {
	await lucia.invalidateSession(sessionId);
}

export async function invalidateUserSessions(userId) {
	await lucia.invalidateUserSessions(userId);
}

export async function hashPassword(password) {
	return await new Argon2id().hash(password);
}

export async function verifyPassword(hash, password) {
	return await new Argon2id().verify(hash, password);
}

export function createSessionCookie(sessionId) {
	return lucia.createSessionCookie(sessionId);
}

export function createBlankSessionCookie() {
	return lucia.createBlankSessionCookie();
}