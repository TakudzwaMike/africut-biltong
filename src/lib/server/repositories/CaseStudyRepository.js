import { db } from '$lib/server/db';
import { caseStudy, caseStudyResult, client } from '$lib/server/db/schema.js';
import { desc, eq, or, ilike, count } from 'drizzle-orm';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('CaseStudyRepository');

export class CaseStudyRepository {
    async findMany({ page = 1, limit = 20, query = '' } = {}) {
        const offset = (page - 1) * limit;

        let filters = undefined;
        if (query) {
            const searchStr = `%${query}%`;
            filters = or(
                ilike(caseStudy.title, searchStr),
                ilike(caseStudy.slug, searchStr)
            );
        }

        const [caseStudies, totalResult] = await Promise.all([
            db.query.caseStudy.findMany({
                where: filters,
                orderBy: desc(caseStudy.id),
                with: {
                    client: {
                        with: { logo: true }
                    },
                    results: true
                },
                limit,
                offset
            }),
            db.select({ count: count() }).from(caseStudy).where(filters)
        ]);

        const totalItems = totalResult[0].count;
        const totalPages = Math.ceil(totalItems / limit);

        return { caseStudies, totalItems, totalPages };
    }

    async findById(id) {
        return db.query.caseStudy.findFirst({
            where: eq(caseStudy.id, id),
            with: {
                client: { with: { logo: true } },
                results: true
            }
        });
    }

    async findBySlug(slug) {
        return db.query.caseStudy.findFirst({
            where: eq(caseStudy.slug, slug),
            with: {
                results: true,
                client: {
                    with: { logo: true }
                }
            }
        });
    }

    async create(data) {
        try {
            const [newCaseStudy] = await db.insert(caseStudy).values(data).returning();
            logger.info(`Created case study: ${newCaseStudy.id}`);
            return newCaseStudy;
        } catch (error) {
            logger.error('Error creating case study', error);
            throw error;
        }
    }

    async update(id, data) {
        try {
            const [updated] = await db.update(caseStudy).set(data).where(eq(caseStudy.id, id)).returning();
            logger.info(`Updated case study: ${id}`);
            return updated;
        } catch (error) {
            logger.error(`Error updating case study ${id}`, error);
            throw error;
        }
    }

    async updateWithResults(id, data, results) {
        try {
            await db.transaction(async (tx) => {
                await tx.update(caseStudy).set(data).where(eq(caseStudy.id, id));

                // Delete old results
                await tx.delete(caseStudyResult).where(eq(caseStudyResult.caseStudyId, id));

                // Insert new results
                if (results && results.length > 0) {
                    await tx.insert(caseStudyResult).values(
                        results.map(result => ({
                            caseStudyId: id,
                            ...result
                        }))
                    );
                }
            });

            logger.info(`Updated case study with results: ${id}`);
        } catch (error) {
            logger.error(`Error updating case study ${id} with results`, error);
            throw error;
        }
    }

    async listClients() {
        return db.query.client.findMany({
            orderBy: desc(client.name)
        });
    }

    async delete(id) {
        try {
            const csToDelete = await db.query.caseStudy.findFirst({
                where: eq(caseStudy.id, id),
                with: { results: true }
            });

            if (!csToDelete) return null;

            await db.delete(caseStudy).where(eq(caseStudy.id, id));
            logger.info(`Deleted case study: ${id}`);
            return csToDelete;
        } catch (error) {
            logger.error(`Error deleting case study ${id}`, error);
            throw error;
        }
    }
}
