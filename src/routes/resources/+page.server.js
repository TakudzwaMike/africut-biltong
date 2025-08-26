import { db } from '$lib/server/db';
import { caseStudy } from '$lib/server/db/schema.js';
import { desc } from 'drizzle-orm';

export async function load() {
	const caseStudies = await db.query.caseStudy.findMany({
		orderBy: desc(caseStudy.id),
		with: {
			client: true,
			results: true
		}
	});

	// Note: The brochure URL is already loaded in the root +layout.server.js
	// and is available via `$page.data.settings` in the Svelte component

	return { caseStudies };
}
