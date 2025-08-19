import { db } from '$lib/server/db';
import { auditLog } from '$lib/server/db/schema';

/**
 * Logs an action to the audit trail.
 * @param {string | null} userId - The ID of the user performing the action.
 * @param {string} action - A description of the action (e.g., 'create_product').
 * @param {{ targetId?: string | number, data?: any }} options - Additional details.
 */
export async function log(userId, action, options = {}) {
	try {
		await db.insert(auditLog).values({
			userId,
			action,
			targetId: options.targetId ? String(options.targetId) : null,
			data: options.data || null
		});
	} catch (error) {
		// Log to console if the audit log itself fails, but don't crash the original action
		console.error('Failed to write to audit log:', error);
	}
}