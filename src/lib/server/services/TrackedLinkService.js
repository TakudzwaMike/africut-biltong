import { TrackedLinkRepository } from '$lib/server/repositories/TrackedLinkRepository';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('TrackedLinkService');

export class TrackedLinkService {
    constructor() {
        this.repo = new TrackedLinkRepository();
    }

    async listLinks(params) {
        const links = await this.repo.findAll();
        // Since Repo doesn't return count, we mock pagination structure for now or calculate slice
        return {
            links,
            totalItems: links.length,
            totalPages: 1
        };
    }

    async createLink(userId, data) {
        try {
            const link = await this.repo.create(data);
            logger.info(`User ${userId} created tracked link ${link.id}`);
            return link;
        } catch (err) {
            logger.error('Error creating tracked link', err);
            throw err;
        }
    }

    async getLinkWithVisits(id) {
        const link = await this.repo.findByIdWithVisits(id);
        if (!link) throw new Error('Link not found');
        return link;
    }

    async deleteLink(userId, id) {
        try {
            await this.repo.delete(id);
            logger.info(`User ${userId} deleted tracked link ${id}`);
        } catch (err) {
            logger.error(`Error deleting tracked link ${id}`, err);
            throw err;
        }
    }

    async processRedirect(shortCode, requestHeaders) {
        const link = await this.repo.findByShortCode(shortCode);
        if (!link) return null;

        // Fire and forget logging
        this._logVisit(link.id, requestHeaders);

        return link.destinationUrl;
    }

    async _logVisit(linkId, headers) {
        const uaString = headers.get('user-agent') || '';
        const ipCountry = headers.get('x-vercel-ip-country');

        // Basic Parsing
        let browser = 'Unknown';
        let os = 'Unknown';
        let deviceType = 'desktop';

        if (/mobile/i.test(uaString)) deviceType = 'mobile';
        if (/like Mac OS X/.test(uaString)) {
            os = 'iOS';
            deviceType = 'mobile';
        } else if (/Android/.test(uaString)) {
            os = 'Android';
            deviceType = 'mobile';
        } else if (/Mac OS X/.test(uaString)) os = 'macOS';
        else if (/Windows/.test(uaString)) os = 'Windows';
        else if (/Linux/.test(uaString)) os = 'Linux';

        if (/Edg/.test(uaString)) browser = 'Edge';
        else if (/Chrome/.test(uaString)) browser = 'Chrome';
        else if (/Firefox/.test(uaString)) browser = 'Firefox';
        else if (/Safari/.test(uaString)) browser = 'Safari';

        if (/LinkedIn/.test(uaString)) browser = 'LinkedIn App';
        if (/FBAN|FBAV/.test(uaString)) browser = 'Facebook App';
        if (/Twitter/.test(uaString)) browser = 'Twitter App';

        await this.repo.createVisit({
            linkId,
            ipCountry,
            browser,
            os,
            deviceType,
            referrer: headers.get('referer') || null
        });
    }
}
