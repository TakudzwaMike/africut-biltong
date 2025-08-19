import { db } from '$lib/server/db';
import { product } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export async function load() {
	const products = await db.query.product.findMany({
		orderBy: desc(product.id)
	});
	return { products };
}