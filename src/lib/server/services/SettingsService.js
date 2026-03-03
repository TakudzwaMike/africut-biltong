import { SettingsRepository } from '$lib/server/repositories/SettingsRepository';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('SettingsService');

export class SettingsService {
    constructor() {
        this.repo = new SettingsRepository();
    }

    async getSettings() {
        return this.repo.getSettings();
    }

    async updateSettings(userId, settings) {
        try {
            await this.repo.upsertSettings(settings);
            logger.info(`User ${userId} updated site settings`);
        } catch (err) {
            logger.error('Error updating site settings', err);
            throw err;
        }
    }
}
