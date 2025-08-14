import { db } from '$lib/server/db';

export async function load() {
	const caseStudies = await db.query.caseStudy.findMany({
		with: {
			results: true
		}
	});
	return { caseStudies };
}