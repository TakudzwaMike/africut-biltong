import { SaleEventRepository } from '$lib/server/repositories/SaleEventRepository';
import { DiscountCodeRepository } from '$lib/server/repositories/DiscountCodeRepository';
import { LoggerService } from '$lib/server/services/LoggerService';
import { error } from '@sveltejs/kit';

const logger = LoggerService.for('MarketingService');

export class MarketingService {
    constructor() {
        this.eventRepo = new SaleEventRepository();
        this.codeRepo = new DiscountCodeRepository();
    }

    async listEvents() {
        return this.eventRepo.findAll();
    }

    async listCodes() {
        return this.codeRepo.findAll();
    }

    async getEventById(id) {
        const event = await this.eventRepo.findById(id);
        if (!event) {
            throw new Error('Sale event not found');
        }
        return event;
    }

    async getCodeById(id) {
        const code = await this.codeRepo.findById(id);
        if (!code) {
            throw new Error('Discount code not found');
        }
        return code;
    }

    async updateEvent(userId, id, data) {
        try {
            const event = await this.eventRepo.update(id, data);
            logger.info(`User ${userId} updated sale event ${id}`);
            return event;
        } catch (err) {
            logger.error(`Error updating sale event ${id}`, err);
            throw err;
        }
    }

    async updateCode(userId, id, data) {
        try {
            const code = await this.codeRepo.update(id, data);
            logger.info(`User ${userId} updated discount code ${id}`);
            return code;
        } catch (err) {
            logger.error(`Error updating discount code ${id}`, err);
            throw err;
        }
    }

    async deleteEvent(userId, id) {
        try {
            const deleted = await this.eventRepo.delete(id);
            logger.info(`User ${userId} deleted sale event ${id}`);
            return deleted;
        } catch (err) {
            logger.error(`Error deleting sale event ${id}`, err);
            throw err;
        }
    }

    async deleteCode(userId, id) {
        try {
            const deleted = await this.codeRepo.delete(id);
            logger.info(`User ${userId} deleted discount code ${id}`);
            return deleted;
        } catch (err) {
            logger.error(`Error deleting discount code ${id}`, err);
            throw err;
        }
    }

    async updateEventPrices(userId, eventId, priceUpdates) {
        try {
            await this.eventRepo.updateBulkPrices(eventId, priceUpdates);
            logger.info(`User ${userId} updated prices for event ${eventId}`);
        } catch (err) {
            logger.error(`Error updating prices for event ${eventId}`, err);
            throw err;
        }
    }

    async getEventWithPrices(id) {
        const result = await this.eventRepo.findByIdWithPrices(id);
        if (!result) throw new Error('Event not found');
        return result;
    }

    /**
     * Create a new sale event.
     * @param {string} userId - Actor ID
     * @param {Object} data
     */
    async createSaleEvent(userId, { name, publicLabel, startsAt, endsAt }) {
        if (!name || !startsAt || !endsAt) {
            throw error(400, 'Name and Dates are required.');
        }

        try {
            const newEvent = await this.eventRepo.create({
                name: String(name),
                publicLabel: publicLabel ? String(publicLabel) : null,
                startsAt: new Date(String(startsAt)),
                endsAt: new Date(String(endsAt)),
                isActive: false
            });

            logger.info(`User ${userId} created sale event ${newEvent.id}`);
            return newEvent;
        } catch (err) {
            logger.error('Error creating sale event', err);
            throw err;
        }
    }

    /**
     * Create a new discount code.
     * @param {string} userId
     * @param {Object} data
     */
    async createDiscountCode(userId, { code, type, valueRaw, usageLimitRaw, minOrderRaw, startsAt, endsAt }) {
        if (!code || !type || !valueRaw) {
            throw error(400, 'Code, Type, and Value are required.');
        }

        try {
            let value = Number(valueRaw);
            // Business Rule: If fixed amount, ensure we store in cents or appropriate unit if needed?
            // The prompt says "value = Math.round(value * 100)" for fixed types in the original code.
            // Wait, looking at original code: `if (type === 'fixed') { value = Math.round(value * 100); }`
            // NOTE: Only if the input implies currency (e.g. dollars). If the UI sends cents, this is different.
            // Assuming UI sends "Dollars" (e.g. 10.50)

            if (type === 'fixed') {
                value = Math.round(value * 100);
            }

            const minOrderAmount = minOrderRaw ? Math.round(Number(minOrderRaw) * 100) : null;
            const usageLimit = usageLimitRaw ? parseInt(String(usageLimitRaw)) : null;
            const finalCode = String(code).toUpperCase().trim();

            const newCode = await this.codeRepo.create({
                code: finalCode,
                type: String(type),
                value,
                usageLimit,
                minOrderAmount,
                startsAt: startsAt ? new Date(String(startsAt)) : null,
                endsAt: endsAt ? new Date(String(endsAt)) : null,
            });

            logger.info(`User ${userId} created discount code ${newCode.id}`);
            return newCode;
        } catch (err) {
            // Check for duplicate code error if possible, wrapper?
            if (err.message && err.message.includes('unique constraint')) {
                throw error(400, 'This code already exists.');
            }
            logger.error('Error creating discount code', err);
            throw err;
        }
    }
}

