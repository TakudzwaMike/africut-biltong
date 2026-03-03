import { db } from '$lib/server/db';
import { client, testimonial } from '$lib/server/db/schema.js';
import { desc, eq, isNotNull, and, gt } from 'drizzle-orm';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('PartnerRepository');

export class PartnerRepository {
    async findAll() {
        return this.findMany();
    }

    async findMany({ limit, requireLogo = false } = {}) {
        const conditions = [];
        if (requireLogo) {
            // Assuming import { isNotNull } from 'drizzle-orm' is needed. 
            // But existing code only imported desc, eq from 'drizzle-orm'.
            // I need to add isNotNull to imports.
        }

        return db.query.client.findMany({
            orderBy: desc(client.id),
            where: requireLogo ? isNotNull(client.mediaId) : undefined,
            with: {
                logo: true
            },
            limit
        });
    }

    async findById(id) {
        return db.query.client.findFirst({ where: eq(client.id, id) });
    }

    async findTestimonialByToken(token) {
        return db.query.testimonial.findFirst({
            where: and(
                eq(testimonial.submissionToken, token),
                eq(testimonial.status, 'pending'),
                gt(testimonial.tokenExpiresAt, new Date())
            ),
            with: {
                client: true
            }
        });
    }

    async updateTestimonial(token, data) {
        return db.update(testimonial)
            .set({
                ...data,
                status: 'submitted'
            })
            .where(eq(testimonial.submissionToken, token))
            .returning();
    }

    async create(data) {
        try {
            const [newClient] = await db.insert(client).values(data).returning();
            logger.info(`Created client: ${newClient.id}`);
            return newClient;
        } catch (error) {
            logger.error('Error creating client', error);
            throw error;
        }
    }

    async update(id, data) {
        try {
            await db.update(client).set(data).where(eq(client.id, id));
            logger.info(`Updated client: ${id}`);
            return this.findById(id);
        } catch (error) {
            logger.error(`Error updating client ${id}`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const clientToDelete = await this.findById(id);
            if (!clientToDelete) return null;

            await db.delete(client).where(eq(client.id, id));
            logger.info(`Deleted client: ${id}`);
            return clientToDelete;
        } catch (error) {
            logger.error(`Error deleting client ${id}`, error);
            throw error;
        }
    }
}
