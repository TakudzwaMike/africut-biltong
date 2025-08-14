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
			username: attributes.username
		};
	}
});

export const sessionCookieName = lucia.sessionCookieName;

/** @param {string} userId */
export async function createSession(userId) {
	return await lucia.createSession(userId, {});
}

/** @param {string} sessionId */
export async function validateSession(sessionId) {
	return await lucia.validateSession(sessionId);
}

/** @param {string} sessionId */
export async function invalidateSession(sessionId) {
	await lucia.invalidateSession(sessionId);
}

/** @param {string} password */
export async function hashPassword(password) {
	return await new Argon2id().hash(password);
}

/**
 * @param {string} hash
 * @param {string} password
 */
export async function verifyPassword(hash, password) {
	return await new Argon2id().verify(hash, password);
}

/**
 * @param {string} sessionId
 * @returns {import('oslo/cookie').Cookie}
 */
export function createSessionCookie(sessionId) {
	return lucia.createSessionCookie(sessionId);
}

/**
 * @returns {import('oslo/cookie').Cookie}
 */
export function createBlankSessionCookie() {
	return lucia.createBlankSessionCookie();
}