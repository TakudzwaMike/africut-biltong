import { LeadRepository } from '$lib/server/repositories/LeadRepository';
import { OrderRepository } from '$lib/server/repositories/OrderRepository';
import { ProductRepository } from '$lib/server/repositories/ProductRepository';
import { BlogRepository } from '$lib/server/repositories/BlogRepository';
import { SaleEventRepository } from '$lib/server/repositories/SaleEventRepository';
import { LoggerService } from '$lib/server/services/LoggerService';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db'; // Needed for specific health checks (latency)

const logger = LoggerService.for('DashboardService');

export class DashboardService {
    constructor() {
        this.leadRepo = new LeadRepository();
        this.orderRepo = new OrderRepository();
        this.productRepo = new ProductRepository();
        this.blogRepo = new BlogRepository();
        this.saleRepo = new SaleEventRepository();
    }

    async getOverviewStats() {
        const start = performance.now();

        // Parallel Data Fetching
        const [
            totalLeads,
            newLeads,
            totalOrders,
            totalProducts,
            totalPosts,
            revenueStats,
            lowStockItems,
            activeSales
        ] = await Promise.all([
            this.leadRepo.count(),
            this.leadRepo.count({ status: 'new' }),
            this.orderRepo.count(),
            this.productRepo.count(),
            this.blogRepo.count(),
            this.orderRepo.getRevenueByCurrency(),
            this.productRepo.findLowStock(5),
            this.saleRepo.findActive(3)
        ]);

        const end = performance.now();
        const dbLatency = Math.round(end - start);

        // System Health Checks
        const health = this._measureSystemHealth(dbLatency);

        // Process Revenue
        const revenue = { USD: 0, ZAR: 0 };
        revenueStats.forEach(stat => {
            if (stat.currency === 'USD') revenue.USD = Number(stat.total) || 0;
            if (stat.currency === 'ZAR') revenue.ZAR = Number(stat.total) || 0;
        });

        const overallStatus = Object.values(health).every(s => s.status === 'operational')
            ? 'healthy'
            : 'degraded';

        return {
            stats: {
                totalLeads,
                newLeads,
                totalOrders,
                totalProducts,
                totalPosts,
                revenue
            },
            insights: {
                lowStock: lowStockItems,
                activeEvents: activeSales
            },
            system: {
                overallStatus,
                checks: health
            }
        };
    }

    _measureSystemHealth(dbLatency) {
        return {
            database: {
                status: 'operational',
                latency: dbLatency,
                message: dbLatency > 500 ? 'High Latency' : 'Optimal'
            },
            storage: {
                status: env.BLOB_READ_WRITE_TOKEN ? 'operational' : 'missing',
                message: env.BLOB_READ_WRITE_TOKEN ? 'Connected' : 'Token Missing'
            },
            email: {
                status: env.RESEND_API_KEY ? 'operational' : 'missing',
                message: env.RESEND_API_KEY ? 'Ready' : 'Key Missing'
            },
            scheduler: {
                status: env.CRON_SECRET ? 'operational' : 'warning',
                message: env.CRON_SECRET ? 'Secured' : 'No Secret Set'
            }
        };
    }
}
