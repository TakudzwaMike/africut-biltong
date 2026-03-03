import { db } from '$lib/server/db';
import { order } from '$lib/server/db/schema.js';
import { desc, eq, count, sum } from 'drizzle-orm';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('OrderRepository');

export class OrderRepository {
    /**
     * @param {object} params
     * @param {number} params.page
     * @param {number} params.limit
     * @param {string} [params.query]
     */
    async findMany({ page = 1, limit = 20, query = '' } = {}) {
        const offset = (page - 1) * limit;

        // Query logic would go here if implemented, for now simplified as per original

        const [orders, totalResult] = await Promise.all([
            db.query.order.findMany({
                orderBy: desc(order.createdAt),
                limit: limit,
                offset: offset,
                with: {
                    user: {
                        columns: { email: true, firstName: true, lastName: true }
                    }
                }
            }),
            db.select({ count: count() }).from(order)
        ]);

        const totalItems = totalResult[0].count;
        const totalPages = Math.ceil(totalItems / limit);

        return { orders, totalItems, totalPages };
    }

    async findById(id) {
        return db.query.order.findFirst({
            where: eq(order.id, id),
            with: {
                user: true,
                items: { with: { productVariant: { with: { product: true } } } },
                shippingAddress: true,
                discountCode: true
            }
        });
    }

    async findByIdWithRelations(id) {
        return db.query.order.findFirst({
            where: eq(order.id, id),
            with: {
                user: true,
                shippingAddress: true,
                discountCode: true,
                items: {
                    with: {
                        variant: {
                            with: { product: true }
                        }
                    }
                }
            }
        });
    }

    async findByPublicId(publicId) {
        return db.query.order.findFirst({
            where: eq(order.publicId, publicId),
            with: {
                items: {
                    with: {
                        productVariant: {
                            with: {
                                product: true
                            }
                        }
                    }
                },
                shippingAddress: true,
                discountCode: true
            }
        });
    }

    async updateStatus(id, status, paymentUrl = null) {
        const updateData = { status };
        if (paymentUrl) updateData.paymentGatewayPollUrl = paymentUrl;

        await db.update(order).set(updateData).where(eq(order.id, id));
        logger.info(`Updated order ${id} status to ${status}`);
        return this.findById(id);
    }

    async count() {
        const result = await db.select({ count: count() }).from(order);
        return result[0]?.count || 0;
    }

    async getRevenueByCurrency() {
        return db.select({
            currency: order.currency,
            total: sum(order.total)
        }).from(order).where(eq(order.status, 'paid')).groupBy(order.currency);
    }
}
