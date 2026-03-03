import { OrderRepository } from '$lib/server/repositories/OrderRepository';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('OrderService');

export class OrderService {
    constructor() {
        this.repo = new OrderRepository();
    }

    async listOrders(params) {
        return this.repo.findMany(params);
    }

    async getOrder(id) {
        return this.repo.findById(id);
    }

    async getOrderByPublicId(publicId) {
        return this.repo.findByPublicId(publicId);
    }

    async getOrderWithDetails(id) {
        const order = await this.repo.findByIdWithRelations(id);
        if (!order) throw new Error('Order not found');
        return order;
    }

    async updateOrderStatus(userId, id, status) {
        try {
            const result = await this.repo.updateStatus(id, status);
            logger.info(`User ${userId} updated order ${id} status to ${status}`);
            return result;
        } catch (err) {
            logger.error(`Error updating order ${id}`, err);
            throw err;
        }
    }
}
