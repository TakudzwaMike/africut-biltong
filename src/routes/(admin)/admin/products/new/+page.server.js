import { db } from '$lib/server/db';
import { product } from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { uploadFile } from '$lib/server/blob';
import { log } from '$lib/server/auditLog.js';

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);
		const { name, slug, shortDescription, longDescription: longDescriptionJson, ctaText, ctaLink } = data;
		const imageFile = formData.get('image');

		if (!name || !slug) {
			return fail(400, { data, message: 'Product Name and Slug are required.' });
		}

		let imageUrl = null;
		if (imageFile instanceof File && imageFile.size > 0) {
			try {
				const buffer = Buffer.from(await imageFile.arrayBuffer());
				imageUrl = await uploadFile(buffer, imageFile.name, imageFile.type);
			} catch (error) {
				console.error('Blob Upload Error:', error);
				return fail(500, { data, message: 'Failed to upload image.' });
			}
		}

		let longDescription;
		try {
			longDescription = longDescriptionJson ? JSON.parse(String(longDescriptionJson)) : null;
		} catch (e) {
			return fail(400, { data, message: 'Invalid content format.' });
		}

		try {
			const [newProduct] = await db
				.insert(product)
				.values({
					name: String(name),
					slug: String(slug),
					shortDescription: String(shortDescription),
					longDescription,
					imageUrl,
					ctaText: String(ctaText),
					ctaLink: String(ctaLink)
				})
				.returning();

			await log(locals.user?.id, 'create_product', {
				targetId: newProduct.id,
				data: newProduct
			});
		} catch (error) {
			console.error('Error creating product:', error);
			// Exclude the non-serializable 'image' file from the returned data
			const { image, ...restOfData } = data;
			if (error.message.includes('duplicate key value violates unique constraint')) {
				return fail(400, { data: restOfData, message: 'This slug is already in use. Please choose another.' });
			}
			return fail(500, { data: restOfData, message: 'Could not create the product.' });
		}

		throw redirect(303, '/admin/products');
	}
};