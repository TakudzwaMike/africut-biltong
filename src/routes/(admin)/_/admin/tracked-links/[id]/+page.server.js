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
				columns: { username: true }
			},
			visits: {
				orderBy: (visits, { desc }) => [desc(visits.visitedAt)],
                limit: 100 // Limit to last 100 for the table
			}
		}
	});

	if (!link) {
		throw error(404, 'Link not found');
	}

    // Aggregate Stats
    const stats = {
        total: link.visits.length,
        countries: {},
        browsers: {},
        devices: {}
    };

    // Re-fetch ALL visits for aggregation (since we limited the details to 100)
    // Note: In a huge app, do this with SQL 'GROUP BY'. For now, JS is fine.
    // Actually, since `visits` above is limited, we should do a separate aggregation query if we want accurate totals.
    // Let's stick to the raw data for simplicity in this iteration, or do a SQL count.
    
    link.visits.forEach(v => {
        const country = v.ipCountry || 'Unknown';
        stats.countries[country] = (stats.countries[country] || 0) + 1;

        const browser = v.browser || 'Unknown';
        stats.browsers[browser] = (stats.browsers[browser] || 0) + 1;

        const device = v.deviceType || 'desktop';
        stats.devices[device] = (stats.devices[device] || 0) + 1;
    });

	return { link, stats };
}