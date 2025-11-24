import { db } from '$lib/server/db';
import { lead, order, product, blogPost } from '$lib/server/db/schema.js';
import { count, eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';

export async function load({ locals }) {
	const start = performance.now();

	// 1. Perform DB Queries
	const [leadCount] = await db.select({ count: count() }).from(lead);
	const [newLeadCount] = await db.select({ count: count() }).from(lead).where(eq(lead.status, 'new'));
	const [orderCount] = await db.select({ count: count() }).from(order);
	const [productCount] = await db.select({ count: count() }).from(product);
	const [postCount] = await db.select({ count: count() }).from(blogPost);

	const end = performance.now();
	const dbLatency = Math.round(end - start);

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
			totalLeads: leadCount.count,
			newLeads: newLeadCount.count,
			totalOrders: orderCount.count,
			totalProducts: productCount.count,
			totalPosts: postCount.count
		},
		system: {
			overallStatus,
			checks: health
		}
	};
}