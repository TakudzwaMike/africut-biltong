import { db } from '$lib/server/db';
import { lead } from '$lib/server/db/schema.js';
import { desc, eq, or, ilike, count } from 'drizzle-orm';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('LeadRepository');

export class LeadRepository {
    async findMany({ page = 1, limit = 20, query = '' } = {}) {
        const offset = (page - 1) * limit;

        let filters = undefined;
        if (query) {
            const searchStr = `%${query}%`;
            filters = or(
                ilike(lead.firstName, searchStr),
                ilike(lead.lastName, searchStr),
                ilike(lead.email, searchStr),
                ilike(lead.status, searchStr)
            );
        }

        const [leads, totalResult] = await Promise.all([
            db.query.lead.findMany({
                where: filters,
                orderBy: desc(lead.createdAt),
                with: {
                    solution: true
                },
                limit,
                offset
            }),
            db.select({ count: count() }).from(lead).where(filters)
        ]);

        const totalItems = totalResult[0].count;
        const totalPages = Math.ceil(totalItems / limit);

        return { leads, totalItems, totalPages };
    }

    async findAll() {
        return db.query.lead.findMany({
            orderBy: desc(lead.createdAt),
            with: {
                solution: {
                    columns: {
                        solutionName: true
                    }
                }
            }
        });
    }

    async updateStatus(id, status) {
        try {
            await db.update(lead).set({ status }).where(eq(lead.id, id));
            logger.info(`Updated lead ${id} status to ${status}`);
            return true;
        } catch (error) {
            logger.error(`Error updating lead ${id}`, error);
            throw error;
        }
    }

    /**
     * @param {object} filters
     * @param {string} [filters.status]
     */
    async count(filters = {}) {
        let whereClause = undefined;
        if (filters.status) {
            whereClause = eq(lead.status, /** @type {any} */(filters.status));
        }

        const result = await db.select({ count: count() })
            .from(lead)
            .where(whereClause);

        return result[0]?.count || 0;
    }
}
