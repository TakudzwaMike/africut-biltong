import { db } from '$lib/server/db';
import { order } from '$lib/server/db/schema.js';
import { desc, count } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

const ITEMS_PER_PAGE = 20;
const ALLOWED_ROLES = ['admin', 'store_manager'];

export async function load({ url, locals }) {
	// SECURITY CHECK
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden: You do not have access to Orders.');
	}

    const query = url.searchParams.get('q') || ''; // Capture query
	const page = Number(url.searchParams.get('page')) || 1;
	const offset = (page - 1) * ITEMS_PER_PAGE;

    // Note: If you implement search filtering later, apply 'query' logic here
    // For now, we just pass it back so the UI doesn't crash

	const [orders, totalResult] = await Promise.all([
		db.query.order.findMany({
			orderBy: desc(order.createdAt),
			limit: ITEMS_PER_PAGE,
			offset: offset,
			with: {
				user: {
                    columns: { email: true, firstName: true, lastName: true }
                }
			}
		}),
		db.select({ count: count() }).from(order)
	]);

	const totalItems = totalResult[0].count;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

	return { 
		orders, 
		pagination: {
			page,
			totalPages,
			totalItems,
            query // FIX: Return this
		} 
	};
}