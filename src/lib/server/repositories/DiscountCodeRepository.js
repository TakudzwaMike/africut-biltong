import { db } from '$lib/server/db';
import { discountCode } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('DiscountCodeRepository');

export class DiscountCodeRepository {
    async findAll() {
        return db.query.discountCode.findMany({
            orderBy: desc(discountCode.id)
        });
    }

    async findById(id) {
        return db.query.discountCode.findFirst({
            where: eq(discountCode.id, id)
        });
    }

    async create(data) {
        try {
            const [newCode] = await db.insert(discountCode).values({
                ...data,
                isActive: true
            }).returning();

            logger.info(`Created discount code: ${newCode.id}`, { code: newCode.code });
            return newCode;
        } catch (error) {
            logger.error('Error creating discount code', error);
            throw error;
        }
    }

    async update(id, data) {
        try {
            const [updated] = await db.update(discountCode).set(data).where(eq(discountCode.id, id)).returning();
            logger.info(`Updated discount code: ${id}`);
            return updated;
        } catch (error) {
            logger.error(`Error updating discount code ${id}`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const codeToDelete = await this.findById(id);
            if (!codeToDelete) return null;

            await db.delete(discountCode).where(eq(discountCode.id, id));
            logger.info(`Deleted discount code: ${id}`);
            return codeToDelete;
        } catch (error) {
            logger.error(`Error deleting discount code ${id}`, error);
            throw error;
        }
    }
}
