import { db } from '$lib/server/db';
import { document, media } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('DocumentRepository');

export class DocumentRepository {
    async findMany() {
        return db.query.document.findMany({
            orderBy: desc(document.createdAt),
            with: {
                thumbnail: true
            }
        });
    }

    async findById(id) {
        return db.query.document.findFirst({
            where: eq(document.id, id)
        });
    }

    async create(data) {
        try {
            const [newDoc] = await db.insert(document).values(data).returning();
            logger.info(`Created document: ${newDoc.id}`);
            return newDoc;
        } catch (error) {
            logger.error('Error creating document', error);
            throw error;
        }
    }

    async update(id, data) {
        try {
            await db.update(document).set(data).where(eq(document.id, id));
            logger.info(`Updated document: ${id}`);
            return this.findById(id);
        } catch (error) {
            logger.error(`Error updating document ${id}`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const docToDelete = await this.findById(id);
            if (!docToDelete) return null;

            await db.delete(document).where(eq(document.id, id));
            logger.info(`Deleted document: ${id}`);
            return docToDelete;
        } catch (error) {
            logger.error(`Error deleting document ${id}`, error);
            throw error;
        }
    }
}
