import { db } from '$lib/server/db';
import { product } from '$lib/server/db/schema.js';
import { fail, redirect, error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { uploadFile } from '$lib/server/blob';
import { log } from '$lib/server/auditLog.js';

export async function load({ params }) {
	const id = Number(params.id);
	if (isNaN(id)) {
		throw error(404, 'Not found');
	}

	const prod = await db.query.product.findFirst({
		where: eq(product.id, id)
	});

	if (!prod) {
		throw error(404, 'Not found');
	}

	return { product: prod };
}

export const actions = {
	default: async ({ request, params, locals }) => {
		const id = Number(params.id);
		const formData = await request.formData();
		const data = Object.fromEntries(formData);
		const { name, slug, shortDescription, longDescription: longDescriptionJson, ctaText, ctaLink } = data;
		const imageFile = formData.get('image');

		if (!name || !slug) {
			return fail(400, { data, message: 'Product Name and Slug are required.' });
		}

		const dataToUpdate = {
			name: String(name),
			slug: String(slug),
			shortDescription: String(shortDescription),
			ctaText: String(ctaText),
			ctaLink: String(ctaLink)
		};

		if (imageFile instanceof File && imageFile.size > 0) {
			try {
				const buffer = Buffer.from(await imageFile.arrayBuffer());
				dataToUpdate.imageUrl = await uploadFile(buffer, imageFile.name, imageFile.type);
			} catch (err) {
				console.error('Blob Upload Error:', err);
				return fail(500, { data, message: 'Failed to upload new image.' });
			}
		}

		try {
			const content = longDescriptionJson ? JSON.parse(String(longDescriptionJson)) : null;
			dataToUpdate.longDescription = content;
		} catch (e) {
			return fail(400, { data, message: 'Invalid content format.' });
		}

		try {
			await db.update(product).set(dataToUpdate).where(eq(product.id, id));

			await log(locals.user?.id, 'update_product', {
				targetId: id,
				data: dataToUpdate
			});
		} catch (error) {
			console.error('Error updating product:', error);
			// Exclude the non-serializable 'image' file from the returned data
			const { image, ...restOfData } = data;
			if (error.message.includes('duplicate key value violates unique constraint')) {
				return fail(400, { data: restOfData, message: 'This slug is already in use. Please choose another.' });
			}
			return fail(500, { data: restOfData, message: 'Could not update the product.' });
		}

		throw redirect(303, '/admin/products');
	}
};