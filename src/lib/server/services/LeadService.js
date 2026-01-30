import { LeadRepository } from '$lib/server/repositories/LeadRepository';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('LeadService');

export class LeadService {
    constructor() {
        this.repo = new LeadRepository();
    }

    async listLeads(params) {
        return this.repo.findMany(params);
    }

    async getAllLeads() {
        return this.repo.findAll();
    }

    async updateLeadStatus(userId, id, status) {
        try {
            const lead = await this.repo.update(id, { status });
            logger.info(`User ${userId} updated lead ${id} status to ${status}`);
            return lead;
        } catch (err) {
            logger.error(`Error updating lead ${id} status`, err);
            throw err;
        }
    }

    async deleteLead(userId, id) {
        try {
            await this.repo.delete(id);
            logger.info(`User ${userId} deleted lead ${id}`);
        } catch (err) {
            logger.error(`Error deleting lead ${id}`, err);
            throw err;
        }
    }
}
