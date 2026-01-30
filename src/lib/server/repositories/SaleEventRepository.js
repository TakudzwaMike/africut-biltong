import { db } from '$lib/server/db';
import { saleEvent, salePrice, product, productVariant } from '$lib/server/db/schema';
import { desc, eq, and, lte, gte } from 'drizzle-orm';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('SaleEventRepository');

export class SaleEventRepository {
    async findAll() {
        return db.query.saleEvent.findMany({
            orderBy: desc(saleEvent.startsAt)
        });
    }

    async findById(id) {
        return db.query.saleEvent.findFirst({
            where: eq(saleEvent.id, id)
        });
    }

    async findByIdWithPrices(id) {
        const event = await this.findById(id);
        if (!event) return null;

        const products = await db.query.product.findMany({
            orderBy: desc(product.name),
            with: {
                variants: true
            }
        });

        const existingPrices = await db.query.salePrice.findMany({
            where: eq(salePrice.eventId, id)
        });

        const priceMap = existingPrices.reduce((acc, item) => {
            acc[item.variantId] = item;
            return acc;
        }, {});

        return { event, products, priceMap };
    }

    async findActive(limit = 3) {
        const now = new Date();
        return db.query.saleEvent.findMany({
            where: and(
                eq(saleEvent.isActive, true),
                lte(saleEvent.startsAt, now),
                gte(saleEvent.endsAt, now)
            ),
            limit
        });
    }

    async create(data) {
        try {
            const [newEvent] = await db.insert(saleEvent).values({
                ...data,
                isActive: data.isActive ?? false
            }).returning();

            logger.info(`Created sale event: ${newEvent.id}`, { name: newEvent.name });
            return newEvent;
        } catch (error) {
            logger.error('Error creating sale event', error);
            throw error;
        }
    }

    async update(id, data) {
        try {
            const [updated] = await db.update(saleEvent).set(data).where(eq(saleEvent.id, id)).returning();
            logger.info(`Updated sale event: ${id}`);
            return updated;
        } catch (error) {
            logger.error(`Error updating sale event ${id}`, error);
            throw error;
        }
    }

    async updateBulkPrices(eventId, priceUpdates) {
        try {
            await db.transaction(async (tx) => {
                // Clear existing prices
                await tx.delete(salePrice).where(eq(salePrice.eventId, eventId));

                // Insert valid entries
                const validEntries = priceUpdates
                    .filter(u => (u.usd > 0 || u.zar > 0))
                    .map(u => ({
                        eventId,
                        variantId: u.variantId,
                        salePriceUsd: u.usd ? Math.round(u.usd * 100) : null,
                        salePriceZar: u.zar ? Math.round(u.zar * 100) : null
                    }));

                if (validEntries.length > 0) {
                    await tx.insert(salePrice).values(validEntries);
                }
            });

            logger.info(`Updated bulk prices for event: ${eventId}`, { count: priceUpdates.length });
        } catch (error) {
            logger.error(`Error updating bulk prices for event ${eventId}`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const eventToDelete = await this.findById(id);
            if (!eventToDelete) return null;

            await db.delete(saleEvent).where(eq(saleEvent.id, id));
            logger.info(`Deleted sale event: ${id}`);
            return eventToDelete;
        } catch (error) {
            logger.error(`Error deleting sale event ${id}`, error);
            throw error;
        }
    }
}
