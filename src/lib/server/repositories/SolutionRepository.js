import { db } from '$lib/server/db';
import { solution, media, product, solutionsToProducts } from '$lib/server/db/schema.js';
import { desc, eq, or, ilike, count } from 'drizzle-orm';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('SolutionRepository');

export class SolutionRepository {
    async findMany({ page = 1, limit = 20, query = '' } = {}) {
        const offset = (page - 1) * limit;

        let filters = undefined;
        if (query) {
            const searchStr = `%${query}%`;
            filters = or(
                ilike(solution.solutionName, searchStr),
                ilike(solution.shortDescription, searchStr)
            );
        }

        const [solutions, totalResult] = await Promise.all([
            db.query.solution.findMany({
                where: filters,
                orderBy: desc(solution.id),
                with: {
                    featuredImage: true
                },
                limit,
                offset
            }),
            db.select({ count: count() }).from(solution).where(filters)
        ]);

        const totalItems = totalResult[0].count;
        const totalPages = Math.ceil(totalItems / limit);

        return { solutions, totalItems, totalPages };
    }

    async findById(id) {
        return db.query.solution.findFirst({
            where: eq(solution.id, id),
            with: {
                featuredImage: true,
                products: true
            }
        });
    }

    async findBySlug(slug) {
        return db.query.solution.findFirst({
            where: eq(solution.slug, slug),
            with: {
                featuredImage: true,
                products: {
                    with: {
                        product: {
                            with: {
                                featuredImage: true,
                                variants: { where: (v, { eq }) => eq(v.isDefault, true) }
                            }
                        }
                    }
                }
            }
        });
    }

    async listMedia() {
        return db.query.media.findMany({
            orderBy: desc(media.uploadedAt)
        });
    }

    async listProducts() {
        return db.query.product.findMany({
            orderBy: desc(product.name),
            columns: { id: true, name: true }
        });
    }

    async create(data) {
        try {
            const [newSolution] = await db.insert(solution).values(data).returning();
            logger.info(`Created solution: ${newSolution.id}`);
            return newSolution;
        } catch (error) {
            logger.error('Error creating solution', error);
            throw error;
        }
    }

    async update(id, data) {
        try {
            const [updated] = await db.update(solution).set(data).where(eq(solution.id, id)).returning();
            logger.info(`Updated solution: ${id}`);
            return updated;
        } catch (error) {
            logger.error(`Error updating solution ${id}`, error);
            throw error;
        }
    }

    async updateWithProducts(id, data, productIds) {
        try {
            await db.transaction(async (tx) => {
                await tx.update(solution).set(data).where(eq(solution.id, id));

                // Delete old product associations
                await tx.delete(solutionsToProducts).where(eq(solutionsToProducts.solutionId, id));

                // Insert new product associations
                if (productIds && productIds.length > 0) {
                    await tx.insert(solutionsToProducts).values(
                        productIds.map(prodId => ({
                            solutionId: id,
                            productId: prodId
                        }))
                    );
                }
            });

            logger.info(`Updated solution with products: ${id}`);
        } catch (error) {
            logger.error(`Error updating solution ${id} with products`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const solutionToDelete = await db.query.solution.findFirst({
                where: eq(solution.id, id)
            });

            if (!solutionToDelete) return null;

            await db.delete(solution).where(eq(solution.id, id));
            logger.info(`Deleted solution: ${id}`);
            return solutionToDelete;
        } catch (error) {
            logger.error(`Error deleting solution ${id}`, error);
            throw error;
        }
    }
}
