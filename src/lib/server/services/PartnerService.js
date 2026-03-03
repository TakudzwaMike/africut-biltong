import { PartnerRepository } from '$lib/server/repositories/PartnerRepository';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('PartnerService');

export class PartnerService {
    constructor() {
        this.repo = new PartnerRepository();
    }

    async listPartners(params) {
        return this.repo.findMany(params);
    }

    async createPartner(userId, data) {
        try {
            const partner = await this.repo.create(data);
            logger.info(`User ${userId} created partner ${partner.id}`);
            return partner;
        } catch (err) {
            logger.error('Error creating partner', err);
            throw err;
        }
    }

    async getTestimonialByToken(token) {
        return this.repo.findTestimonialByToken(token);
    }

    async submitTestimonial(token, data) {
        const result = await this.repo.updateTestimonial(token, data);
        if (!result || result.length === 0) {
            throw new Error('This testimonial link is invalid or has expired.');
        }
        return result[0];
    }

    async updatePartner(userId, id, data) {
        try {
            await this.repo.update(id, data);
            logger.info(`User ${userId} updated partner ${id}`);
        } catch (err) {
            logger.error(`Error updating partner ${id}`, err);
            throw err;
        }
    }

    async deletePartner(userId, id) {
        try {
            await this.repo.delete(id);
            logger.info(`User ${userId} deleted partner ${id}`);
        } catch (err) {
            logger.error(`Error deleting partner ${id}`, err);
            throw err;
        }
    }
}
