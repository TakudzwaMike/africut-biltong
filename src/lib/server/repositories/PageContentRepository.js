import { db } from '$lib/server/db';
import { pageContent } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('PageContentRepository');

export class PageContentRepository {
    async findBySection(section) {
        return db.query.pageContent.findFirst({
            where: eq(pageContent.section, section)
        });
    }

    async findByPage(page) {
        return db.query.pageContent.findMany({
            where: eq(pageContent.page, page),
            with: {
                media: true
            }
        });
    }

    async create(data) {
        return db.insert(pageContent).values(data).returning();
    }

    async findAll() {
        // Provisioning moved to Service
        return db.query.pageContent.findMany({
            with: {
                media: true
            }
        });
    }

    async findById(id) {
        return db.query.pageContent.findFirst({
            where: eq(pageContent.id, id),
            with: {
                media: true
            }
        });
    }

    async update(id, data) {
        try {
            await db.update(pageContent).set(data).where(eq(pageContent.id, id));
            logger.info(`Updated page content: ${id}`);
            return true;
        } catch (error) {
            logger.error(`Error updating page content ${id}`, error);
            throw error;
        }
    }
}
