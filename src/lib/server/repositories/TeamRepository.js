import { db } from '$lib/server/db';
import { teamMember } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('TeamRepository');

export class TeamRepository {
    async findAll() {
        return db.query.teamMember.findMany({
            orderBy: desc(teamMember.id),
            with: {
                photo: true
            }
        });
    }

    async findById(id) {
        return db.query.teamMember.findFirst({ where: eq(teamMember.id, id) });
    }

    async create(data) {
        try {
            const [newMember] = await db.insert(teamMember).values(data).returning();
            logger.info(`Created team member: ${newMember.id}`);
            return newMember;
        } catch (error) {
            logger.error('Error creating team member', error);
            throw error;
        }
    }

    async update(id, data) {
        try {
            await db.update(teamMember).set(data).where(eq(teamMember.id, id));
            logger.info(`Updated team member: ${id}`);
            return this.findById(id);
        } catch (error) {
            logger.error(`Error updating team member ${id}`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const memberToDelete = await this.findById(id);
            if (!memberToDelete) return null;

            await db.delete(teamMember).where(eq(teamMember.id, id));
            logger.info(`Deleted team member: ${id}`);
            return memberToDelete;
        } catch (error) {
            logger.error(`Error deleting team member ${id}`, error);
            throw error;
        }
    }
}
