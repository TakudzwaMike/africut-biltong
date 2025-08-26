import { db } from '$lib/server/db';
import { solution } from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { uploadFile } from '$lib/server/blob';
import { log } from '$lib/server/auditLog.js';

const toRichText = (text) => {
	if (!text) return [];
	return [{ type: 'paragraph', children: [{ text: String(text) }] }];
};

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);
		const { solutionName, slug, shortDescription, longDescription, ctaText, ctaLink } = data;
		const imageFile = formData.get('image');

		if (!solutionName || !slug) {
			return fail(400, { data, message: 'Solution Name and Slug are required.' });
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

		try {
			const valuesToInsert = {
				solutionName: String(solutionName),
				slug: String(slug),
				shortDescription: String(shortDescription),
				longDescription: toRichText(longDescription),
				imageUrl,
				ctaText: String(ctaText),
				ctaLink: String(ctaLink)
			};

			const [newSolution] = await db.insert(solution).values(valuesToInsert).returning();

			await log(locals.user?.id, 'create_solution', {
				targetId: newSolution.id,
				data: newSolution
			});
		} catch (error) {
			console.error('Error creating solution:', error);
			const { image, ...restOfData } = data;
			if (error.message.includes('duplicate key value violates unique constraint')) {
				return fail(400, {
					data: restOfData,
					message: 'This slug is already in use. Please choose another.'
				});
			}
			return fail(500, { data: restOfData, message: 'Could not create the solution.' });
		}

		throw redirect(302, '/admin/solutions');
	}
};