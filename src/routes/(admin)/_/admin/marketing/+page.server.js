import { db } from '$lib/server/db';
import { saleEvent, discountCode } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

const ALLOWED_ROLES = ['admin', 'store_manager'];

export async function load({ locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden: You do not have permission to access Marketing.');
	}

	const [events, codes] = await Promise.all([
		db.query.saleEvent.findMany({
			orderBy: desc(saleEvent.startsAt)
		}),
		db.query.discountCode.findMany({
			orderBy: desc(discountCode.id)
		})
	]);

	return { 
		events,
		codes
	};
}
