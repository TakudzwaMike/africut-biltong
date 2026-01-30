import { AuditLogRepository } from '$lib/server/repositories/AuditLogRepository';
export { log } from '$lib/server/auditLog';

import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('AuditLogService');

export class AuditLogService {
    constructor() {
        this.repo = new AuditLogRepository();
    }

    async listLogs(params) {
        return this.repo.findMany(params);
    }

    // Logs are typically created via the `log` helper directly, 
    // but we can expose a method here if we want to centralize it further.
    // For now, listing is the primary admin function.
}
