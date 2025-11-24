import { db } from '$lib/server/db';
import { solution, media } from '$lib/server/db/schema.js';
import { fail, redirect, error } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import { log } from '$lib/server/auditLog.js';

export async function load({ params }) {
	const id = Number(params.id);
	if (isNaN(id)) {
		throw error(404, 'Not found');
	}

	const sol = await db.query.solution.findFirst({
		where: eq(solution.id, id),
		with: {
			featuredImage: true
		}
	});

	if (!sol) {
		throw error(404, 'Not found');
	}

	const mediaItems = await db.query.media.findMany({
		orderBy: desc(media.uploadedAt)
	});

	return {
		solution: sol,
		mediaItems
	};
}

export const actions = {
	default: async ({ request, params, locals }) => {
		const id = Number(params.id);
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

		const dataToUpdate = {
			solutionName: String(solutionName),
			slug: String(slug),
			shortDescription: String(shortDescription),
			longDescription,
			ctaText: String(ctaText),
			ctaLink: String(ctaLink),
			mediaId: mediaId ? Number(mediaId) : null
		};

		try {
			await db.update(solution).set(dataToUpdate).where(eq(solution.id, id));

			await log(locals.user?.id, 'update_solution', {
				targetId: id,
				data: dataToUpdate
			});
		} catch (error) {
			console.error('Error updating solution:', error);
			if (error.message.includes('duplicate key value violates unique constraint')) {
				return fail({
					data,
					message: 'This slug is already in use. Please choose another.'
				});
			}
			return fail({ data, message: 'Could not update the solution.' });
		}

		throw redirect(302, '/_/admin/solutions');
	}
};