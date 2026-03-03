import { SolutionService } from '$lib/server/services/SolutionService';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const { slug } = params;

	const service = new SolutionService();
	const solution = await service.getSolutionBySlug(slug);

	if (!solution) {
		throw error(404, 'Solution not found');
	}

	return { solution };
}