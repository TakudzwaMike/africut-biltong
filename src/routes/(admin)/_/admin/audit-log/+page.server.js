import { db } from '$lib/server/db';
import { auditLog } from '$lib/server/db/schema.js';
import { desc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

const ALLOWED_ROLES = ['admin'];

export async function load({ locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden: Only administrators can view the audit log');
	}

	const logs = await db.query.auditLog.findMany({
		orderBy: desc(auditLog.createdAt),
		with: {
			user: {
				columns: {
					username: true,
                    email: true
				}
			}
		},
		limit: 100
	});
	return { logs };
}