import { db } from '$lib/server/db';
import { trackedLink, linkVisit } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { LoggerService } from '$lib/server/services/LoggerService';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);
const logger = LoggerService.for('TrackedLinkRepository');

export class TrackedLinkRepository {
    async findAll() {
        return db.query.trackedLink.findMany({
            orderBy: desc(trackedLink.createdAt),
            with: {
                user: {
                    columns: { username: true }
                },
                visits: {
                    columns: { id: true }
                }
            }
        });
    }

    async findById(id) {
        return db.query.trackedLink.findFirst({
            where: eq(trackedLink.id, id)
        });
    }

    async findByIdWithVisits(id) {
        return db.query.trackedLink.findFirst({
            where: eq(trackedLink.id, id),
            with: {
                user: {
                    columns: { username: true }
                },
                visits: {
                    orderBy: (visits, { desc }) => [desc(visits.visitedAt)],
                    limit: 100
                }
            }
        });
    }

    async findByShortCode(shortCode) {
        return db.query.trackedLink.findFirst({
            where: eq(trackedLink.shortCode, shortCode)
        });
    }

    async createVisit(data) {
        try {
            await db.insert(linkVisit).values(data);
        } catch (error) {
            logger.error('Error creating link visit', error);
            // Don't throw, failing to log visit shouldn't crash app
        }
    }

    async create(data) {
        try {
            const shortCode = nanoid();
            // Data should contain { destinationUrl, description, userId }
            const [newLink] = await db.insert(trackedLink).values({
                shortCode,
                ...data
            }).returning();

            logger.info(`Created tracked link: ${newLink.id}`, { shortCode });
            return newLink;
        } catch (error) {
            logger.error('Error creating tracked link', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const linkToDelete = await this.findById(id);
            if (!linkToDelete) return null;

            await db.delete(trackedLink).where(eq(trackedLink.id, id));
            logger.info(`Deleted tracked link: ${id}`);
            return linkToDelete;
        } catch (error) {
            logger.error(`Error deleting tracked link ${id}`, error);
            throw error;
        }
    }
}
