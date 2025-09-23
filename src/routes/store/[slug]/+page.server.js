import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import { product as productTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function load({ params }) {
	const { slug } = params;

	const product = await db.query.product.findFirst({
		where: eq(productTable.slug, slug),
			with: {
				featuredImage: true,
				galleryImages: {
					with: {
						media: true
					},
					orderBy: (images, { asc }) => [asc(images.displayOrder)]
				}
			}
	});

	if (!product) {
		throw error(404, 'Product not found');
	}

	return {
		product
	};
}