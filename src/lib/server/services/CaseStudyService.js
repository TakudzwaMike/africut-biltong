import { CaseStudyRepository } from '$lib/server/repositories/CaseStudyRepository';
import { LoggerService } from './LoggerService';

export class CaseStudyService {
    constructor() {
        this.repo = new CaseStudyRepository();
        this.logger = LoggerService.for('CaseStudyService');
    }

    async listCaseStudies(params = {}) {
        return this.repo.findMany(params);
    }

    async getCaseStudyBySlug(slug) {
        return this.repo.findBySlug(slug);
    }

    async getCaseStudyById(id) {
        const caseStudy = await this.repo.findById(id);
        if (!caseStudy) {
            throw new Error('Case study not found');
        }
        return caseStudy;
    }

    async createCaseStudy(userId, data) {
        try {
            const caseStudy = await this.repo.create(data);
            this.logger.info(`User ${userId} created case study ${caseStudy.id}`);
            return caseStudy;
        } catch (err) {
            this.logger.error('Error creating case study', err);
            throw err;
        }
    }

    async updateCaseStudy(userId, id, data) {
        try {
            const caseStudy = await this.repo.update(id, data);
            this.logger.info(`User ${userId} updated case study ${id}`);
            return caseStudy;
        } catch (err) {
            this.logger.error(`Error updating case study ${id}`, err);
            throw err;
        }
    }

    async updateCaseStudyWithResults(userId, id, data, results) {
        try {
            await this.repo.updateWithResults(id, data, results);
            this.logger.info(`User ${userId} updated case study ${id} with results`);
        } catch (err) {
            this.logger.error(`Error updating case study ${id} with results`, err);
            throw err;
        }
    }

    async deleteCaseStudy(userId, id) {
        try {
            const deleted = await this.repo.delete(id);
            this.logger.info(`User ${userId} deleted case study ${id}`);
            return deleted;
        } catch (err) {
            this.logger.error(`Error deleting case study ${id}`, err);
            throw err;
        }
    }

    async listClients() {
        return this.repo.listClients();
    }
}

