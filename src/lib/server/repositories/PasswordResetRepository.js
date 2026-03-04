import { db } from '$lib/server/db';
import { passwordResetToken } from '$lib/server/db/schema.js';
import { eq, and, gt } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('PasswordResetRepository');

/**
 * Repository for password reset token data access.
 */
export class PasswordResetRepository {
    /**
     * Create a new password reset token for a user.
     * Deletes any existing tokens for the user first.
     * @param {string} userId
     * @returns {Promise<{id: string, userId: string, expiresAt: Date}>}
     */
    async create(userId) {
        // Invalidate any existing tokens for this user
        await this.deleteAllForUser(userId);

        const tokenId = createId();
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

        try {
            const [token] = await db.insert(passwordResetToken).values({
                id: tokenId,
                userId,
                expiresAt
            }).returning();
            logger.info(`Created password reset token for user ${userId}`);
            return token;
        } catch (error) {
            logger.error('Error creating password reset token', error);
            throw error;
        }
    }

    /**
     * Find a valid (unexpired) token by ID.
     * @param {string} tokenId
     * @returns {Promise<object|undefined>}
     */
    async findValidToken(tokenId) {
        return db.query.passwordResetToken.findFirst({
            where: and(
                eq(passwordResetToken.id, tokenId),
                gt(passwordResetToken.expiresAt, new Date())
            )
        });
    }

    /**
     * Delete a specific token.
     * @param {string} tokenId
     */
    async delete(tokenId) {
        await db.delete(passwordResetToken).where(eq(passwordResetToken.id, tokenId));
    }

    /**
     * Delete all tokens for a user.
     * @param {string} userId
     */
    async deleteAllForUser(userId) {
        await db.delete(passwordResetToken).where(eq(passwordResetToken.userId, userId));
    }
}
