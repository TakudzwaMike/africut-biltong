import { db } from '$lib/server/db';
import { siteSettings } from '$lib/server/db/schema.js';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('SettingsRepository');

export class SettingsRepository {
    /**
     * @returns {Promise<Record<string, string | null>>}
     */
    async getSettings() {
        const allSettings = await db.query.siteSettings.findMany();
        return allSettings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, /** @type {Record<string, string | null>} */({}));
    }

    async updateSetting(key, value) {
        try {
            await db
                .insert(siteSettings)
                .values({ key, value: String(value) })
                .onConflictDoUpdate({ target: siteSettings.key, set: { value: String(value) } });
            // logger.debug(`Updated setting: ${key}`); // Too verbose?
        } catch (error) {
            logger.error(`Error updating setting ${key}`, error);
            throw error;
        }
    }

    async updateBatch(settingsMap) {
        try {
            for (const [key, value] of Object.entries(settingsMap)) {
                if (value !== undefined && value !== null) {
                    await this.updateSetting(key, value);
                }
            }
            logger.info('Updated batch settings', { keys: Object.keys(settingsMap) });
        } catch (error) {
            logger.error('Error batch updating settings', error);
            throw error;
        }
    }
}
