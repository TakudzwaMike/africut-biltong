import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const { slug } = params;

	const caseStudy = await db.query.caseStudy.findFirst({
		where: (cs, { eq }) => eq(cs.slug, slug),
		with: {
			results: true
		}
	});

	if (!caseStudy) {
		throw error(404, 'Case study not found');
	}

	return {
		caseStudy
	};
}