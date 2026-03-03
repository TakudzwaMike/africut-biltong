import { LocationRepository } from '$lib/server/repositories/LocationRepository';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('LocationService');

export class LocationService {
    constructor() {
        this.repo = new LocationRepository();
    }

    async listLocations() {
        return this.repo.findAll();
    }

    async createLocation(userId, data) {
        try {
            const location = await this.repo.create(data);
            logger.info(`User ${userId} created location ${location.id}`);
            return location;
        } catch (err) {
            logger.error('Error creating location', err);
            throw err;
        }
    }

    async deleteLocation(userId, id) {
        try {
            await this.repo.delete(id);
            logger.info(`User ${userId} deleted location ${id}`);
        } catch (err) {
            logger.error(`Error deleting location ${id}`, err);
            throw err;
        }
    }
}
