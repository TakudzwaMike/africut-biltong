import { db } from '$lib/server/db';
import { auditLog } from '$lib/server/db/schema.js';
import { desc, count } from 'drizzle-orm';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('AuditLogRepository');

export class AuditLogRepository {
    async findMany({ page = 1, limit = 50, action = null, userId = null } = {}) {
        const offset = (page - 1) * limit;

        /** @type {import('drizzle-orm').SQL | undefined} */
        let filters = undefined;
        // Simple filtering logic if needed, can expand later
        /*
        if (action) filters = eq(auditLog.action, action);
        // Combine with userId...
        */

        const [logs, totalResult] = await Promise.all([
            db.query.auditLog.findMany({
                orderBy: desc(auditLog.createdAt),
                with: {
                    user: {
                        columns: {
                            username: true,
                            email: true
                        }
                    }
                },
                limit,
                offset
            }),
            db.select({ count: count() }).from(auditLog)
        ]);

        const totalItems = Number(totalResult[0]?.count || 0);
        const totalPages = Math.ceil(totalItems / limit);

        return { logs, totalItems, totalPages };
    }

    // Keep backward compatibility if needed, or just remove if unused elsewhere
    async findRecent({ limit = 100 } = {}) {
        const { logs } = await this.findMany({ limit });
        return logs;
    }
}
