import { db } from '$lib/server/db';
import { userInvite } from '$lib/server/db/schema.js';
import { eq, and, isNull, gt } from 'drizzle-orm';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('UserInviteRepository');

/**
 * Repository for User Invite data access operations.
 * Follows the Repository Pattern - encapsulates all database queries for user invites.
 */
export class UserInviteRepository {
    /**
     * Find a valid (unused and not expired) invite by token.
     * @param {string} token
     * @returns {Promise<object|undefined>}
     */
    async findValidInviteByToken(token) {
        return db.query.userInvite.findFirst({
            where: and(
                eq(userInvite.token, token),
                isNull(userInvite.usedAt),
                gt(userInvite.expiresAt, new Date())
            )
        });
    }

    /**
     * Mark an invite as used.
     * @param {number} inviteId
     * @returns {Promise<void>}
     */
    async markAsUsed(inviteId) {
        try {
            await db.update(userInvite)
                .set({ usedAt: new Date() })
                .where(eq(userInvite.id, inviteId));
            logger.info(`Marked invite as used: ${inviteId}`);
        } catch (error) {
            logger.error(`Error marking invite ${inviteId} as used`, error);
            throw error;
        }
    }

    /**
     * Create a new invite.
     * @param {object} data - Invite data
     * @param {string} data.token - Unique invite token
     * @param {Date} data.expiresAt - Expiration date
     * @param {string} [data.createdBy] - User ID who created the invite
     * @param {string} [data.email] - Email for the invite
     * @param {string} [data.role] - Role for the invitee
     * @returns {Promise<object>}
     */
    async create(data) {
        try {
            const [newInvite] = await db.insert(userInvite).values(data).returning();
            logger.info(`Created invite: ${newInvite.id}`);
            return newInvite;
        } catch (error) {
            logger.error('Error creating invite', error);
            throw error;
        }
    }

    /**
     * Find an invite by ID.
     * @param {number} id
     * @returns {Promise<object|undefined>}
     */
    async findById(id) {
        return db.query.userInvite.findFirst({
            where: eq(userInvite.id, id)
        });
    }

    /**
     * Delete an invite.
     * @param {number} id
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        try {
            await db.delete(userInvite).where(eq(userInvite.id, id));
            logger.info(`Deleted invite: ${id}`);
            return true;
        } catch (error) {
            logger.error(`Error deleting invite ${id}`, error);
            throw error;
        }
    }
}
