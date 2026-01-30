import { db } from '$lib/server/db';
import { location } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('LocationRepository');

export class LocationRepository {
    async findAll() {
        return db.query.location.findMany({
            orderBy: desc(location.id)
        });
    }

    async findById(id) {
        return db.query.location.findFirst({ where: eq(location.id, id) });
    }

    async create(data) {
        try {
            const [newLocation] = await db.insert(location).values(data).returning();
            logger.info(`Created location: ${newLocation.id}`);
            return newLocation;
        } catch (error) {
            logger.error('Error creating location', error);
            throw error;
        }
    }

    async update(id, data) {
        try {
            await db.update(location).set(data).where(eq(location.id, id));
            logger.info(`Updated location: ${id}`);
            return this.findById(id);
        } catch (error) {
            logger.error(`Error updating location ${id}`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const locToDelete = await this.findById(id);
            if (!locToDelete) return null;

            await db.delete(location).where(eq(location.id, id));
            logger.info(`Deleted location: ${id}`);
            return locToDelete;
        } catch (error) {
            logger.error(`Error deleting location ${id}`, error);
            throw error;
        }
    }
}
