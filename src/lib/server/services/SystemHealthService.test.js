import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import { SystemHealthService } from '$lib/server/services/SystemHealthService';

describe('SystemHealthService', () => {
    it('should be able to instantiate', () => {
        const service = new SystemHealthService();
        expect(service).toBeTruthy();
    });

    it('should return a health report', async () => {
        const service = new SystemHealthService();
        const report = await service.getHealthReport();

        console.log('Health Report:', JSON.stringify(report, null, 2));

        expect(report).toHaveProperty('database');
        expect(report).toHaveProperty('paynow');
        expect(report).toHaveProperty('paystack');
        expect(report).toHaveProperty('timestamp');

        // We expect database to be up if docker is running (it should be)
        expect(report.database.status).toBe('up');

        // Paynow/Paystack might be down if env vars are missing, but we expect the check to return a result
        expect(['up', 'down']).toContain(report.paynow.status);
        expect(['up', 'down']).toContain(report.paystack.status);
    });
});
