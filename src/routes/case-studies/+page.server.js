import { db } from '$lib/server/db';
import { caseStudy } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export async function load() {
	const caseStudies = await db.query.caseStudy.findMany({
		orderBy: desc(caseStudy.id),
		with: {
			results: true,
			client: {
				with: {
					logo: true
				}
			}
		}
	});
	return { caseStudies };
}