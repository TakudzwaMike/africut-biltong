import { db } from '$lib/server/db';
import { product, media, productImage } from '$lib/server/db/schema.js';
import { desc, eq, or, ilike, count } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';

const ITEMS_PER_PAGE = 20;

export async function load({ url }) {
	// 1. Pagination & Search Params
	const query = url.searchParams.get('q');
	const page = Number(url.searchParams.get('page')) || 1;
	const offset = (page - 1) * ITEMS_PER_PAGE;

	// 2. Filters
	let filters = undefined;
	if (query) {
		const searchStr = `%${query}%`;
		filters = or(
			ilike(product.name, searchStr),
			ilike(product.slug, searchStr)
		);
	}

	// 3. Parallel Queries
	const [products, totalResult, mediaItems] = await Promise.all([
		db.query.product.findMany({
			where: filters,
			orderBy: desc(product.id),
			limit: ITEMS_PER_PAGE,
			offset: offset,
			with: {
				featuredImage: true,
				galleryImages: {
					with: {
						media: true
					}
				}
			}
		}),
		db.select({ count: count() }).from(product).where(filters),
		db.query.media.findMany({ orderBy: desc(media.uploadedAt) })
	]);

	const totalItems = totalResult[0].count;
	const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

	return { 
		products, 
		mediaItems,
		pagination: {
			page,
			totalPages,
			totalItems,
			query
		}
	};
}

export const actions = {
	save: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const galleryImageIds = formData.getAll('galleryImageIds').map(Number);
		const {
			name,
			slug,
			shortDescription,
			longDescription: longDescriptionJson,
			ctaText,
			ctaLink,
			mediaId,
			type,
			priceUSD,
			priceZAR,
			stockQuantity
		} = Object.fromEntries(formData);

		if (!name || !slug) {
			return fail(400, { message: 'Name and Slug are required.' });
		}

		let longDescription = null;
		if (longDescriptionJson && typeof longDescriptionJson === 'string' && longDescriptionJson !== 'null') {
			try {
				longDescription = JSON.parse(longDescriptionJson);
			} catch (e) {
				return fail(400, { message: 'Invalid rich text format.' });
			}
		}

		const dataToSave = {
			name: String(name),
			slug: String(slug),
			shortDescription: String(shortDescription),
			longDescription,
			mediaId: mediaId ? Number(mediaId) : null,
			ctaText: String(ctaText) || null,
			ctaLink: String(ctaLink) || null,
			type: String(type),
			prices: {
				USD: priceUSD ? Math.round(parseFloat(priceUSD) * 100) : null,
				ZAR: priceZAR ? Math.round(parseFloat(priceZAR) * 100) : null
			},
			stockQuantity: stockQuantity ? Number(stockQuantity) : null
		};

		try {
			if (isNaN(id) || !id) {
				const [newProduct] = await db.insert(product).values(dataToSave).returning();
				if (galleryImageIds.length > 0) {
					await db.insert(productImage).values(
						galleryImageIds.map((mediaId, index) => ({
							productId: newProduct.id,
							mediaId,
							displayOrder: index
						}))
					);
				}
				await log(locals.user?.id, 'create_product', {
					targetId: newProduct.id,
					data: { ...newProduct, galleryImageIds }
				});
			} else {
				await db.transaction(async (tx) => {
					await tx.update(product).set(dataToSave).where(eq(product.id, id));
					await tx.delete(productImage).where(eq(productImage.productId, id));
					if (galleryImageIds.length > 0) {
						await tx.insert(productImage).values(
							galleryImageIds.map((mediaId, index) => ({
								productId: id,
								mediaId,
								displayOrder: index
							}))
						);
					}
				});
				await log(locals.user?.id, 'update_product', {
					targetId: id,
					data: { ...dataToSave, galleryImageIds }
				});
			}
			return { success: true, message: 'Product saved successfully.' };
		} catch (error) {
			console.error('Error saving product:', error);
			if (error.message.includes('duplicate key value violates unique constraint')) {
				return fail(400, { message: 'A product with this slug already exists.' });
			}
			return fail(500, { message: 'Could not save the product.' });
		}
	},
	delete: async ({ url, locals }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Invalid request' });
		}

		try {
			const productToDelete = await db.query.product.findFirst({
				where: eq(product.id, Number(id))
			});

			if (!productToDelete) {
				return fail(404, { message: 'Product not found.' });
			}

			await db.delete(product).where(eq(product.id, Number(id)));

			await log(locals.user?.id, 'delete_product', {
				targetId: id,
				data: productToDelete
			});

			return { status: 200, message: 'Product deleted successfully.' };
		} catch (error) {
			console.error(`Error deleting product: ${error}`);
			return fail(500, { message: 'Could not delete the product.' });
		}
	}
};