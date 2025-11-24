import { db } from '$lib/server/db';
import { solution, media } from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';
import { desc } from 'drizzle-orm';

export async function load() {
	const mediaItems = await db.query.media.findMany({
		orderBy: desc(media.uploadedAt)
	});
	return { mediaItems };
}

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);
		const {
			solutionName,
			slug,
			shortDescription,
			longDescription: longDescriptionJson,
			ctaText,
			ctaLink,
			mediaId
		} = data;

		if (!solutionName || !slug) {
			return fail(400, { data, message: 'Solution Name and Slug are required.' });
		}

		let longDescription;
		try {
			longDescription = longDescriptionJson ? JSON.parse(String(longDescriptionJson)) : null;
		} catch (e) {
			return fail(400, { data, message: 'Invalid rich text format for long description.' });
		}

		try {
			const valuesToInsert = {
				solutionName: String(solutionName),
				slug: String(slug),
				shortDescription: String(shortDescription),
				longDescription,
				mediaId: mediaId ? Number(mediaId) : null,
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

		throw redirect(302, '/_/admin/solutions');
	}
};