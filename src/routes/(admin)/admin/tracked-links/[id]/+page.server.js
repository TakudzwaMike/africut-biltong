import { db } from '$lib/server/db';
import { trackedLink } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const id = Number(params.id);
	if (isNaN(id)) {
		throw error(404, 'Not found');
	}

	const link = await db.query.trackedLink.findFirst({
		where: eq(trackedLink.id, id),
		with: {
			user: {
				columns: {
					username: true
				}
			},
			visits: {
				orderBy: (visits, { desc }) => [desc(visits.visitedAt)]
			}
		}
	});

	if (!link) {
		throw error(404, 'Link not found');
	}

	// Group visits by country for a summary
	const visitsByCountry = link.visits.reduce((acc, visit) => {
		const country = visit.ipCountry || 'Unknown';
		acc[country] = (acc[country] || 0) + 1;
		return acc;
	}, {});

	return { link, visitsByCountry };
}