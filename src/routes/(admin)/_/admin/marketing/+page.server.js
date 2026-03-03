import { error } from '@sveltejs/kit';
import { MarketingService } from '$lib/server/services/MarketingService';

const marketingService = new MarketingService();

export async function load({ locals }) {
	if (!locals.user || locals.user.role !== 'admin') {
		throw error(403, 'Forbidden');
	}

	const events = await marketingService.listEvents();
	const codes = await marketingService.listCodes();

	return { events, codes };
}
