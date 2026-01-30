import { fail, error } from '@sveltejs/kit';
import { ALLOWED_ROLES } from '$lib/server/services/AuthService';
import { log } from '$lib/server/services/AuditLogService';
import { SolutionService } from '$lib/server/services/SolutionService';

const solutionService = new SolutionService();

export async function load({ params, locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden: You do not have permission to edit solutions.');
	}

	const id = Number(params.id);
	if (isNaN(id)) {
		throw error(404, 'Not found');
	}

	const sol = await solutionService.getSolutionById(id);
	const mediaItems = await solutionService.listMedia();
	const allProducts = await solutionService.listProducts();

	return {
		solution: sol,
		mediaItems,
		allProducts
	};
}

export const actions = {
	default: async ({ request, params, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

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
			await solutionService.updateSolutionWithProducts(locals.user.id, id, dataToUpdate, productIds);

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