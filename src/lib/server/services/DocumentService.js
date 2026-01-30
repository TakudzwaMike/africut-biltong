import { DocumentRepository } from '$lib/server/repositories/DocumentRepository';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('DocumentService');

export class DocumentService {
    constructor() {
        this.repo = new DocumentRepository();
    }

    async listDocuments(params) {
        return this.repo.findMany(params);
    }

    async createDocument(userId, data) {
        try {
            const doc = await this.repo.create(data);
            logger.info(`User ${userId} created document ${doc.id}`);
            return doc;
        } catch (err) {
            logger.error('Error creating document', err);
            throw err;
        }
    }

    async updateDocument(userId, id, data) {
        try {
            const doc = await this.repo.update(id, data);
            logger.info(`User ${userId} updated document ${id}`);
            return doc;
        } catch (err) {
            logger.error(`Error updating document ${id}`, err);
            throw err;
        }
    }

    async deleteDocument(userId, id) {
        try {
            await this.repo.delete(id);
            logger.info(`User ${userId} deleted document ${id}`);
        } catch (err) {
            logger.error(`Error deleting document ${id}`, err);
            throw err;
        }
    }
}
