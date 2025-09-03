import { db } from '$lib/server/db';
import { document as docTable } from '$lib/server/db/schema.js';
import { desc } from 'drizzle-orm';

export async function load() {
	const documents = await db.query.document.findMany({
		orderBy: desc(docTable.createdAt),
		with: {
			thumbnail: true
		}
	});

	const caseStudies = await db.query.caseStudy.findMany({
		orderBy: desc(db.query.caseStudy.findMany.table.id),
		with: {
			client: true,
			results: true
		}
	});

	return { documents, caseStudies };
}