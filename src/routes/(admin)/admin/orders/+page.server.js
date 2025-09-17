import { db } from '$lib/server/db';
import { order } from '$lib/server/db/schema.js';
import { desc } from 'drizzle-orm';

export async function load() {
	const orders = await db.query.order.findMany({
		orderBy: desc(order.createdAt),
		with: {
			items: {
				with: {
					product: true
				}
			}
		}
	});
	return { orders };
}