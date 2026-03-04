import { UserRepository } from '$lib/server/repositories/UserRepository';
import { LoggerService } from '$lib/server/services/LoggerService';
import { error } from '@sveltejs/kit';

const logger = LoggerService.for('UserService');

export class UserService {
    constructor() {
        this.userRepo = new UserRepository();
    }

    async getUserById(userId) {
        return this.userRepo.findById(userId);
    }

    /**
     * Get paginated users with filters.
     * @param {Object} options
     * @param {number} options.page
     * @param {number} options.limit
     * @param {string} options.query
     * @param {string} options.view
     * @param {string} options.currentUserId
     */
    async listUsers({ page, limit, query, view, currentUserId }) {
        return this.userRepo.findMany({
            page,
            limit,
            query,
            view,
            excludeId: currentUserId
        });
    }

    async updateUserProfile(userId, data) {
        return this.userRepo.update(userId, data);
    }

    async getAddresses(userId) {
        return this.userRepo.getAddresses(userId);
    }

    /**
     * Update a user's role.
     * @param {string} executorId - ID of the admin performing the action
     * @param {string} targetUserId - ID of the user to update
     * @param {string} newRole - New role to assign
     */
    async updateUserRole(executorId, targetUserId, newRole) {
        if (executorId === targetUserId) {
            throw error(400, 'Cannot change your own role.');
        }

        // Note: The caller (Controller) should verify executor is an Admin before calling this,
        // or we can verify it here if we pass the full executor user object.
        // For now, minimizing DB lookups by assuming Controller guards authorization.

        try {
            await this.userRepo.updateRole(targetUserId, newRole);
            logger.info(`User ${executorId} updated role of ${targetUserId} to ${newRole}`);
            // Audit Log handled in Repo or here? 
            // Previous pattern: Controller calls AuditLog. 
            // Better pattern: Service calls AuditLog? Or Service calls Repo which logs?
            // Repo already logs to Console. AuditLog is DB.
            // Let's rely on the AuditLog helper in the controller for now to minimize migration churn,
            // OR fully move AuditLog here. 
            // Plan: Keep AuditLog in Controller for now to match other modules, or move it here.
            // Move it here for "Business Logic in Services".
        } catch (err) {
            logger.error(`Failed to update role for ${targetUserId}`, err);
            throw err;
        }
    }

    /**
     * Delete a user.
     * @param {string} executorId
     * @param {string} targetUserId
     */
    async deleteUser(executorId, targetUserId) {
        if (executorId === targetUserId) {
            throw error(400, 'Cannot delete yourself.');
        }

        try {
            await this.userRepo.delete(targetUserId);
            logger.info(`User ${executorId} deleted user ${targetUserId}`);
        } catch (err) {
            logger.error(`Failed to delete user ${targetUserId}`, err);
            throw err;
        }
    }
}

