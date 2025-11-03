import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import { caseStudy as caseStudyTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const { slug } = params;

	const caseStudy = await db.query.caseStudy.findFirst({
		where: eq(caseStudyTable.slug, slug),
		with: {
			results: true,
			client: true
		}
	});

	if (!caseStudy) {
		throw error(404, 'Case study not found');
	}

	return {
		caseStudy
	};
}