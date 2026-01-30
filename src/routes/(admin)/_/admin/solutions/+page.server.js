import { fail, error } from '@sveltejs/kit';
import { SolutionService } from '$lib/server/services/SolutionService';
import { log } from '$lib/server/auditLog';

const solutionService = new SolutionService();

export async function load() {
	return {
		solutions: await solutionService.listSolutions()
	};
}

export const actions = {
	create: async ({ request, locals }) => {
		const formData = await request.formData();
		const title = String(formData.get('title'));
		const slug = String(formData.get('slug'));
		const subtitle = String(formData.get('subtitle'));
		const description = String(formData.get('description'));
		const link = String(formData.get('link'));
		const icon = String(formData.get('icon'));

		if (!title || !slug) return fail(400, { message: 'Title and Slug are required' });

		try {
			const solution = await solutionService.createSolution(locals.user.id, {
				title,
				slug,
				subtitle: subtitle || null,
				description: description || null,
				link: link || null,
				icon: icon || null
			});

			await log(locals.user.id, 'create_solution', { targetId: solution.id, data: { title } });
			return { success: true };
		} catch (err) {
			return fail(500, { message: 'Failed to create solution' });
		}
	},

	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = String(formData.get('id'));

		try {
			await solutionService.deleteSolution(locals.user.id, id);
			await log(locals.user.id, 'delete_solution', { targetId: id });
			return { success: true };
		} catch (err) {
			return fail(500, { message: 'Failed to delete solution' });
		}
	}
};