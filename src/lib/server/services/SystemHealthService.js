import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import { PaymentService } from './payment/PaymentService.js';
import { LoggerService } from './LoggerService.js';

const logger = LoggerService.for('SystemHealthService');

/**
 * ARCHITECTURAL EXCEPTION:
 * This service directly accesses the database for health check purposes.
 * Health checks require raw database connectivity testing that cannot be
 * abstracted through repositories. This is an acceptable violation of the
 * Service → Repository pattern for infrastructure monitoring.
 */


export class SystemHealthService {
    constructor() {
        this.paymentService = new PaymentService();
    }

    async checkDatabase() {
        try {
            await db.execute(sql`SELECT 1`);
            return { status: 'up', message: 'Database is reachable.' };
        } catch (e) {
            return { status: 'down', message: 'Database connection failed.', error: e.message };
        }
    }

    async checkPaynow() {
        try {
            const strategy = this.paymentService.getStrategy('paynow');
            const isHealthy = await strategy.isHealthy();
            return isHealthy
                ? { status: 'up', message: 'Paynow integration is configured.' }
                : { status: 'down', message: 'Paynow integration is missing credentials or unreachable.' };
        } catch (e) {
            return { status: 'down', message: 'Paynow check failed.', error: e.message };
        }
    }

    async checkPaystack() {
        try {
            const strategy = this.paymentService.getStrategy('paystack');
            const isHealthy = await strategy.isHealthy();
            return isHealthy
                ? { status: 'up', message: 'Paystack integration is configured.' }
                : { status: 'down', message: 'Paystack check failed.' };
        } catch (e) {
            return { status: 'down', message: 'Paystack check failed.', error: e.message };
        }
    }

    async getHealthReport() {
        const [dbStatus, paynowStatus, paystackStatus] = await Promise.all([
            this.checkDatabase(),
            this.checkPaynow(),
            this.checkPaystack()
        ]);

        return {
            database: dbStatus,
            paynow: paynowStatus,
            paystack: paystackStatus,
            timestamp: new Date().toISOString()
        };
    }
}
