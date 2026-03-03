import { MediaRepository } from '$lib/server/repositories/MediaRepository';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('MediaService');

export class MediaService {
    constructor() {
        this.repo = new MediaRepository();
    }

    async getMedia(id) {
        return this.repo.findById(id);
    }

    async listMedia(params) {
        return this.repo.findAll(); // TODO: Implement pagination/filtering in Repo if needed
    }

    async createMedia(userId, data) {
        try {
            const media = await this.repo.create(data);
            logger.info(`User ${userId} uploaded media ${media.id}`);
            return media;
        } catch (err) {
            logger.error('Error uploading media', err);
            throw err;
        }
    }

    async deleteMedia(userId, id) {
        try {
            await this.repo.delete(id);
            logger.info(`User ${userId} deleted media ${id}`);
        } catch (err) {
            logger.error(`Error deleting media ${id}`, err);
            throw err;
        }
    }
}
