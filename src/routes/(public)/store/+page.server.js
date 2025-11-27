import { db } from '$lib/server/db';
import { product } from '$lib/server/db/schema';
import { desc, eq, isNotNull, sql } from 'drizzle-orm';
import { applyPricing, getActiveSales } from '$lib/server/pricing';

export async function load() {
    // 1. Parallel Database Queries
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

    // 2. Fetch Pricing Context once
    const pricingContext = await getActiveSales();

    // 3. Apply Pricing
    // We use Promise.all again to process them in parallel using the same context
    const [hardwareP, softwareP, servicesP] = await Promise.all([
        applyPricing(hardware, pricingContext),
        applyPricing(software, pricingContext),
        applyPricing(services, pricingContext)
    ]);

	return {
		collections: {
			hardware: hardwareP,
			software: softwareP,
			services: servicesP
		},
		heroImage: randomHeroProduct?.featuredImage
	};
}
