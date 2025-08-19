import { db } from '$lib/server/db';
import { solution } from '$lib/server/db/schema.js';
import { fail, redirect, error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { uploadFile } from '$lib/server/blob';
import { log } from '$lib/server/auditLog.js';

const toRichText = (text) => {
	if (!text) return [];
	return [{ type: 'paragraph', children: [{ text: String(text) }] }];
};

const fromRichText = (richText) => {
	if (!richText || !Array.isArray(richText) || richText.length === 0) return '';
	return richText.map((p) => p.children.map((c) => c.text).join('')).join('\n\n');
};

export async function load({ params }) {
	const id = Number(params.id);
	if (isNaN(id)) {
		throw error(404, 'Not found');
	}

	const sol = await db.query.solution.findFirst({
		where: eq(solution.id, id)
	});

	if (!sol) {
		throw error(404, 'Not found');
	}

	return {
		solution: {
			...sol,
			longDescription: fromRichText(sol.longDescription)
		}
	};
}

export const actions = {
	default: async ({ request, params, locals }) => {
		const id = Number(params.id);
		const formData = await request.formData();
		const data = Object.fromEntries(formData);
		const { solutionName, slug, shortDescription, longDescription } = data;
		const imageFile = formData.get('image');

		if (!solutionName || !slug) {
			return fail(400, { data, message: 'Solution Name and Slug are required.' });
		}

		const dataToUpdate = {
			solutionName: String(solutionName),
			slug: String(slug),
			shortDescription: String(shortDescription),
			longDescription: toRichText(longDescription)
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
			await db.update(solution).set(dataToUpdate).where(eq(solution.id, id));

			await log(locals.user?.id, 'update_solution', {
				targetId: id,
				data: dataToUpdate
			});
		} catch (error) {
			console.error('Error updating solution:', error);
			const { image, ...restOfData } = data;
			if (error.message.includes('duplicate key value violates unique constraint')) {
				return fail(400, {
					data: restOfData,
					message: 'This slug is already in use. Please choose another.'
				});
			}
			return fail(500, { data: restOfData, message: 'Could not update the solution.' });
		}

		throw redirect(302, '/admin/solutions');
	}
};