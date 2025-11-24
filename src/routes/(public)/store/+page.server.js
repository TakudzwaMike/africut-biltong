import { db } from '$lib/server/db';
import { product } from '$lib/server/db/schema';
import { desc, eq, isNotNull, sql } from 'drizzle-orm';

export async function load() {
	const [hardware, software, services, randomHeroProduct] = await Promise.all([
		db.query.product.findMany({
			where: eq(product.type, 'physical'),
			orderBy: desc(product.createdAt),
			limit: 4,
			with: { featuredImage: true, variants: true }
		}),
		db.query.product.findMany({
			where: eq(product.type, 'digital'),
			orderBy: desc(product.createdAt),
			limit: 4,
			with: { featuredImage: true, variants: true }
		}),
		db.query.product.findMany({
			where: eq(product.type, 'service'),
			orderBy: desc(product.createdAt),
			limit: 4,
			with: { featuredImage: true, variants: true }
		}),
		// Fetch one random product that has an image to use as the hero background
		db.query.product.findFirst({
			where: isNotNull(product.mediaId),
			orderBy: sql`RANDOM()`,
			with: { featuredImage: true }
		})
	]);

	return {
		collections: {
			hardware,
			software,
			services
		},
		heroImage: randomHeroProduct?.featuredImage
	};
}