import { db } from '$lib/server/db';
import { product, media } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';

export async function load() {
	const products = await db.query.product.findMany({
		orderBy: desc(product.id),
		with: {
			featuredImage: true
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
		const {
			name,
			slug,
			shortDescription,
			longDescription: longDescriptionJson,
			ctaText,
			ctaLink,
			mediaId
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
			ctaText: String(ctaText),
			ctaLink: String(ctaLink)
		};

		try {
			if (isNaN(id)) {
				// Create new product
				const [newProduct] = await db.insert(product).values(dataToSave).returning();
				await log(locals.user?.id, 'create_product', {
					targetId: newProduct.id,
					data: newProduct
				});
			} else {
				// Update existing product
				await db.update(product).set(dataToSave).where(eq(product.id, id));
				await log(locals.user?.id, 'update_product', { targetId: id, data: dataToSave });
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