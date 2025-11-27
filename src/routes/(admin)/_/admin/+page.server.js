import { db } from '$lib/server/db';
import { lead, order, product, blogPost, productVariant, saleEvent } from '$lib/server/db/schema.js';
import { count, eq, sum, and, lte, gte, desc } from 'drizzle-orm';
import { env } from '$env/dynamic/private';

export async function load({ locals }) {
	const start = performance.now();
    const now = new Date();

	// 1. Perform DB Queries in Parallel
	const [
        leadCountRes, 
        newLeadCountRes, 
        orderCountRes, 
        productCountRes, 
        postCountRes,
        revenueRes,
        lowStockRes,
        activeEventsRes
    ] = await Promise.all([
        // Basic Counts
		db.select({ count: count() }).from(lead),
		db.select({ count: count() }).from(lead).where(eq(lead.status, 'new')),
		db.select({ count: count() }).from(order),
		db.select({ count: count() }).from(product),
		db.select({ count: count() }).from(blogPost),
        
        // Revenue (Grouped by Currency) - This requires raw SQL usually or aggregation helpers
        db.select({ 
            currency: order.currency, 
            total: sum(order.total) 
        }).from(order).where(eq(order.status, 'paid')).groupBy(order.currency),

        // Low Stock Variants (Threshold < 10)
        db.query.productVariant.findMany({
            where: and(
                eq(productVariant.isDefault, false), // Often default is just a placeholder
                lte(productVariant.stock, 10)
            ),
            with: { product: true },
            limit: 5
        }),

        // Active Sales
        db.query.saleEvent.findMany({
            where: and(
                eq(saleEvent.isActive, true),
                lte(saleEvent.startsAt, now),
                gte(saleEvent.endsAt, now)
            ),
            limit: 3
        })
	]);

	const end = performance.now();
	const dbLatency = Math.round(end - start);

    // Process Revenue
    const revenue = { USD: 0, ZAR: 0 };
    revenueRes.forEach(row => {
        if (row.currency === 'USD') revenue.USD = Number(row.total) || 0;
        if (row.currency === 'ZAR') revenue.ZAR = Number(row.total) || 0;
    });

	// 2. Check Integrations
	const health = {
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

	// Determine overall status
	const overallStatus = Object.values(health).every(s => s.status === 'operational') 
		? 'healthy' 
		: 'degraded';

	return {
		user: locals.user,
		stats: {
			totalLeads: leadCountRes[0].count,
			newLeads: newLeadCountRes[0].count,
			totalOrders: orderCountRes[0].count,
			totalProducts: productCountRes[0].count,
			totalPosts: postCountRes[0].count,
            revenue
		},
        insights: {
            lowStock: lowStockRes,
            activeEvents: activeEventsRes
        },
		system: {
			overallStatus,
			checks: health
		}
	};
}
