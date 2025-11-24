import { db } from '$lib/server/db';
import { solution, media, product, solutionsToProducts } from '$lib/server/db/schema.js';
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
			featuredImage: true,
			products: true
		}
	});

	if (!sol) {
		throw error(404, 'Not found');
	}

	const mediaItems = await db.query.media.findMany({
		orderBy: desc(media.uploadedAt)
	});

	const allProducts = await db.query.product.findMany({
		orderBy: desc(product.name),
		columns: { id: true, name: true }
	});

	return {
		solution: sol,
		mediaItems,
		allProducts
	};
}

export const actions = {
	default: async ({ request, params, locals }) => {
		const id = Number(params.id);
		const formData = await request.formData();
		
		const solutionName = formData.get('solutionName');
		const slug = formData.get('slug');
		const shortDescription = formData.get('shortDescription');
		const longDescriptionJson = formData.get('longDescription');
		const ctaText = formData.get('ctaText');
		const ctaLink = formData.get('ctaLink');
		const mediaId = formData.get('mediaId');
		
		const productIds = formData.getAll('productIds').map(Number);

		if (!solutionName || !slug) {
			return fail(400, { message: 'Solution Name and Slug are required.' });
		}

		let longDescription = null;
		if (longDescriptionJson && typeof longDescriptionJson === 'string' && longDescriptionJson !== 'null' && longDescriptionJson !== '') {
			try {
				longDescription = JSON.parse(longDescriptionJson);
			} catch (e) {
				console.error('JSON Parse Error:', e);
				return fail(400, { message: 'Invalid rich text format for long description.' });
			}
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
			await db.transaction(async (tx) => {
				await tx.update(solution).set(dataToUpdate).where(eq(solution.id, id));

				await tx.delete(solutionsToProducts).where(eq(solutionsToProducts.solutionId, id));
				
				if (productIds.length > 0) {
					await tx.insert(solutionsToProducts).values(
						productIds.map((prodId) => ({
							solutionId: id,
							productId: prodId
						}))
					);
				}
			});

			await log(locals.user?.id, 'update_solution', {
				targetId: id,
				data: { ...dataToUpdate, productIds }
			});
		} catch (error) {
			console.error('Error updating solution:', error);
			if (error.message?.includes('duplicate key value violates unique constraint')) {
				return fail(400, {
					message: 'This slug is already in use. Please choose another.'
				});
			}
			return fail(500, { message: 'Could not update the solution.' });
		}

		throw redirect(302, '/_/admin/solutions');
	}
};