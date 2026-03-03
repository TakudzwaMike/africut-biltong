import { CaseStudyService } from '$lib/server/services/CaseStudyService';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const { slug } = params;

	const service = new CaseStudyService();
	const caseStudy = await service.getCaseStudyBySlug(slug);

	if (!caseStudy) {
		throw error(404, 'Case study not found');
	}

	return { caseStudy };
}