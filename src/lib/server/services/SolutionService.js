import { SolutionRepository } from '$lib/server/repositories/SolutionRepository';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('SolutionService');

export class SolutionService {
    constructor() {
        this.repo = new SolutionRepository();
    }

    async listSolutions() {
        return this.repo.findMany();
    }

    async createSolution(userId, data) {
        try {
            const solution = await this.repo.create(data);
            logger.info(`User ${userId} created solution ${solution.id}`);
            return solution;
        } catch (err) {
            logger.error('Error creating solution', err);
            throw err;
        }
    }

    async updateSolution(userId, id, data) {
        try {
            const solution = await this.repo.update(id, data);
            logger.info(`User ${userId} updated solution ${id}`);
            return solution;
        } catch (err) {
            logger.error(`Error updating solution ${id}`, err);
            throw err;
        }
    }

    async deleteSolution(userId, id) {
        try {
            await this.repo.delete(id);
            logger.info(`User ${userId} deleted solution ${id}`);
        } catch (err) {
            logger.error(`Error deleting solution ${id}`, err);
            throw err;
        }
    }

    async getSolutionById(id) {
        const solution = await this.repo.findById(id);
        if (!solution) throw new Error('Solution not found');
        return solution;
    }

    async listMedia() {
        return this.repo.listMedia();
    }

    async listProducts() {
        return this.repo.listProducts();
    }

    async updateSolutionWithProducts(userId, id, data, productIds) {
        try {
            await this.repo.updateWithProducts(id, data, productIds);
            logger.info(`User ${userId} updated solution ${id} with products`);
        } catch (err) {
            logger.error(`Error updating solution ${id} with products`, err);
            throw err;
        }
    }
}
