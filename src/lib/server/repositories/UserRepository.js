import { db } from '$lib/server/db';
import { userTable, userAddress } from '$lib/server/db/schema.js';
import { eq, desc, ne, or, ilike, and, inArray, count } from 'drizzle-orm';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('UserRepository');
const STAFF_ROLES = ['admin', 'store_manager', 'content_editor'];

export class UserRepository {
    /**
     * Find a user by email address.
     * @param {string} email
     * @returns {Promise<object|undefined>}
     */
    async findByEmail(email) {
        return db.query.userTable.findFirst({
            where: eq(userTable.email, String(email))
        });
    }

    /**
     * Find a user by ID.
     * @param {string} id
     * @returns {Promise<object|undefined>}
     */
    async findById(id) {
        return db.query.userTable.findFirst({
            where: eq(userTable.id, id)
        });
    }

    /**
     * Create a new user.
     * @param {object} data - User data
     * @returns {Promise<object>}
     */
    async create(data) {
        try {
            const [newUser] = await db.insert(userTable).values(data).returning();
            logger.info(`Created user: ${newUser.email || newUser.username} (${newUser.id})`);
            return newUser;
        } catch (error) {
            logger.error('Error creating user', error);
            throw error;
        }
    }

    /**
     * Get all addresses for a user.
     * @param {string} userId 
     */
    async getAddresses(userId) {
        return db.select()
            .from(userAddress)
            .where(eq(userAddress.userId, userId))
            .orderBy(desc(userAddress.isDefault));
    }

    async createAddress(data) {
        // If setting as default, unset others first
        if (data.isDefault) {
            await db.update(userAddress)
                .set({ isDefault: false })
                .where(eq(userAddress.userId, data.userId));
        }
        const [newAddress] = await db.insert(userAddress).values(data).returning();
        return newAddress;
    }

    async updateAddress(userId, addressId, data) {
        if (data.isDefault) {
            await db.update(userAddress)
                .set({ isDefault: false })
                .where(eq(userAddress.userId, userId));
        }
        await db.update(userAddress)
            .set(data)
            .where(and(
                eq(userAddress.id, addressId),
                eq(userAddress.userId, userId)
            ));
        return true;
    }

    async deleteAddress(userId, addressId) {
        await db.delete(userAddress)
            .where(and(
                eq(userAddress.id, addressId),
                eq(userAddress.userId, userId)
            ));
        return true;
    }

    async findMany({ page = 1, limit = 20, query = '', view = 'all', excludeId = '' } = {}) {
        const offset = (page - 1) * limit;

        // Base condition: Exclude self if provided
        const conditions = [];
        if (excludeId) conditions.push(ne(userTable.id, excludeId));

        // 1. Apply View Filter
        if (view === 'staff') {
            conditions.push(inArray(userTable.role, STAFF_ROLES));
        } else if (view === 'customer') {
            conditions.push(eq(userTable.role, 'customer'));
        }

        // 2. Apply Search Filter
        if (query) {
            const searchStr = `%${query}%`;
            conditions.push(or(
                ilike(userTable.email, searchStr),
                ilike(userTable.firstName, searchStr),
                ilike(userTable.lastName, searchStr)
            ));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [users, totalResult] = await Promise.all([
            db.select().from(userTable)
                .where(whereClause)
                .orderBy(desc(userTable.createdAt))
                .limit(limit)
                .offset(offset),
            db.select({ count: count() }).from(userTable).where(whereClause)
        ]);

        const totalItems = totalResult[0].count;
        const totalPages = Math.ceil(totalItems / limit);

        return { users, totalItems, totalPages };
    }

    async update(id, data) {
        try {
            await db.update(userTable)
                .set(data)
                .where(eq(userTable.id, id));
            logger.info(`Updated user: ${id}`);
            return true;
        } catch (error) {
            logger.error(`Error updating user ${id}`, error);
            throw error;
        }
    }

    async updateRole(userId, newRole) {
        try {
            await db.update(userTable)
                .set({ role: newRole })
                .where(eq(userTable.id, userId));
            logger.info(`Updated user role: ${userId} to ${newRole}`);
            return true;
        } catch (error) {
            logger.error(`Error updating role for user ${userId}`, error);
            throw error;
        }
    }

    async delete(userId) {
        try {
            await db.delete(userTable).where(eq(userTable.id, userId));
            logger.info(`Deleted user: ${userId}`);
            return true;
        } catch (error) {
            logger.error(`Error deleting user ${userId}`, error);
            throw error;
        }
    }
}
