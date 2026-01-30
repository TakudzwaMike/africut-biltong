import { TeamRepository } from '$lib/server/repositories/TeamRepository';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('TeamService');

export class TeamService {
    constructor() {
        this.repo = new TeamRepository();
    }

    async listTeamMembers() {
        return this.repo.findAll();
    }

    async createTeamMember(userId, data) {
        try {
            const member = await this.repo.create(data);
            logger.info(`User ${userId} created team member ${member.id}`);
            return member;
        } catch (err) {
            logger.error('Error creating team member', err);
            throw err;
        }
    }

    async deleteTeamMember(userId, id) {
        try {
            await this.repo.delete(id);
            logger.info(`User ${userId} deleted team member ${id}`);
        } catch (err) {
            logger.error(`Error deleting team member ${id}`, err);
            throw err;
        }
    }
}
