import { DashboardService } from '$lib/server/services/DashboardService';

export async function load({ locals }) {
	const dashboardService = new DashboardService();
	const data = await dashboardService.getOverviewStats();

	return {
		user: locals.user,
		...data
	};
}
