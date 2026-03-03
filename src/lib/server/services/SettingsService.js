import { SettingsRepository } from '$lib/server/repositories/SettingsRepository';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('SettingsService');

export class SettingsService {
    constructor() {
        this.repo = new SettingsRepository();
    }

    async getSettings() {
        const rawSettings = await this.repo.getSettings();

        // Map snake_case database keys to camelCase frontend properties
        return {
            siteName: rawSettings.site_name || 'Vision AI Tech',
            brochureUrl: rawSettings.brochure_url || null,
            heroVideoUrl: rawSettings.hero_video_url || '',
            whatsappNumber: rawSettings.whatsapp_number || '',
            siteLogoMediaId: rawSettings.site_logo_media_id ? Number(rawSettings.site_logo_media_id) : null,
            socialLinkedIn: rawSettings.social_linkedin || '',
            socialX: rawSettings.social_x || '',
            socialFacebook: rawSettings.social_facebook || '',
            socialInstagram: rawSettings.social_instagram || '',
            socialTikTok: rawSettings.social_tiktok || '',
            exchangeRate: rawSettings.exchange_rate_usd_to_zar || '18.50'
        };
    }

    async updateSettings(userId, settings) {
        try {
            // Map camelCase frontend properties back to snake_case database keys
            const mappedSettings = {
                site_name: settings.siteName,
                brochure_url: settings.brochureUrl,
                hero_video_url: settings.heroVideoUrl,
                whatsapp_number: settings.whatsappNumber,
                site_logo_media_id: settings.siteLogoMediaId,
                social_linkedin: settings.socialLinkedIn,
                social_x: settings.socialX,
                social_facebook: settings.socialFacebook,
                social_instagram: settings.socialInstagram,
                social_tiktok: settings.socialTikTok,
                exchange_rate_usd_to_zar: settings.exchangeRate
            };

            // Filter out undefined values (only update what's provided)
            const settingsToUpdate = Object.fromEntries(
                Object.entries(mappedSettings).filter(([_, v]) => v !== undefined)
            );

            await this.repo.updateBatch(settingsToUpdate);
            logger.info(`User ${userId} updated site settings`);
        } catch (err) {
            logger.error('Error updating site settings', err);
            throw err;
        }
    }

}
