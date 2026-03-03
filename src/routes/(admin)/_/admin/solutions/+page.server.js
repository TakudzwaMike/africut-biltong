import { fail, error } from '@sveltejs/kit';
import { SolutionService } from '$lib/server/services/SolutionService';
import { log } from '$lib/server/auditLog';

const solutionService = new SolutionService();

export async function load({ url, locals }) {
	const query = url.searchParams.get('q') || '';
	const page = Number(url.searchParams.get('page')) || 1;
	const limit = 20;

	const { solutions, totalItems, totalPages } = await solutionService.listSolutions({
		page,
		limit,
		query
	});

	return {
		solutions,
		pagination: {
			page,
			totalPages,
			totalItems,
			query
		}
	};
}

export const actions = {
	create: async ({ request, locals }) => {
		const formData = await request.formData();
		const solutionName = String(formData.get('solutionName'));
		const slug = String(formData.get('slug'));
		const shortDescription = String(formData.get('shortDescription'));
		const longDescriptionRaw = formData.get('longDescription');
		const ctaText = String(formData.get('ctaText'));
		const ctaLink = String(formData.get('ctaLink'));
		const mediaId = formData.get('mediaId');

		if (!solutionName || !slug) return fail(400, { message: 'Solution Name and Slug are required' });

		let longDescription = null;
		try {
			longDescription = longDescriptionRaw ? JSON.parse(String(longDescriptionRaw)) : null;
		} catch (e) {
			return fail(400, { message: 'Invalid long description format' });
		}

		try {
			const solution = await solutionService.createSolution(locals.user.id, {
				solutionName,
				slug,
				shortDescription: shortDescription || null,
				longDescription,
				ctaLink: ctaLink || null,
				ctaText: ctaText || null,
				mediaId: mediaId ? Number(mediaId) : null
			});

			await log(locals.user.id, 'create_solution', { targetId: solution.id, data: { solutionName } });
			return { success: true };
		} catch (err) {
			console.error('Error creating solution:', err);
			return fail(500, { message: 'Failed to create solution' });
		}
	},

	delete: async ({ url, locals }) => {
		const id = url.searchParams.get('id');

		if (!id) return fail(400, { message: 'ID is required' });

		try {
			await solutionService.deleteSolution(locals.user.id, String(id));
			await log(locals.user.id, 'delete_solution', { targetId: String(id) });
			return { status: 200, success: true };
		} catch (err) {
			return fail(500, { message: 'Failed to delete solution' });
		}
	}
};