import { db } from '$lib/server/db';
import { product, media, productImage } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';

export async function load() {
	const products = await db.query.product.findMany({
		orderBy: desc(product.id),
		with: {
			featuredImage: true,
			galleryImages: {
				with: {
					media: true
				}
			}
		}
	});
	const mediaItems = await db.query.media.findMany({
		orderBy: desc(media.uploadedAt)
	});
	return { products, mediaItems };
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

		let longDescription;
		try {
			longDescription = longDescriptionJson ? JSON.parse(String(longDescriptionJson)) : null;
		} catch (e) {
			return fail(400, { message: 'Invalid rich text format.' });
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
				// Create new product
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
				// Update existing product
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