import { fail } from '@sveltejs/kit';
import { AuditLogService } from '$lib/server/services/AuditLogService';

const auditService = new AuditLogService();
const ITEMS_PER_PAGE = 50;

export async function load({ url }) {
	const page = Number(url.searchParams.get('page')) || 1;
	const action = url.searchParams.get('action') || '';
	const userId = url.searchParams.get('userId') || '';

	const { logs, totalItems, totalPages } = await auditService.listLogs({
		page,
		limit: ITEMS_PER_PAGE,
		action,
		userId
	});

	return {
		logs,
		pagination: {
			page,
			totalPages,
			totalItems,
			action,
			userId
		}
	};
}