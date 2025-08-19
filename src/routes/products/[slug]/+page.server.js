import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import { product as productTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function load({ params }) {
	const { slug } = params;

	const product = await db.query.product.findFirst({
		where: eq(productTable.slug, slug)
	});

	if (!product) {
		throw error(404, 'Product not found');
	}

	return {
		product
	};
}