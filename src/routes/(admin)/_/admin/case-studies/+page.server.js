import { fail, error } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';
import { CaseStudyService } from '$lib/server/services/CaseStudyService';

const csService = new CaseStudyService();
const ITEMS_PER_PAGE = 20;
const ALLOWED_ROLES = ['admin', 'content_editor'];

export async function load({ url, locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden: You do not have permission to manage case studies.');
	}

	const query = url.searchParams.get('q') || '';
	const page = Number(url.searchParams.get('page')) || 1;

	const { caseStudies, totalItems, totalPages } = await csService.listCaseStudies({
		page,
		limit: ITEMS_PER_PAGE,
		query
	});

	return {
		caseStudies,
		pagination: {
			page,
			totalPages,
			totalItems,
			query
		}
	};
}

export const actions = {
	delete: async ({ url, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const id = url.searchParams.get('id');
		if (!id) return fail(400, { message: 'Invalid request' });

		try {
			const deletedCS = await csService.deleteCaseStudy(locals.user.id, Number(id));
			if (!deletedCS) return fail(404, { message: 'Case study not found.' });

			await log(locals.user?.id, 'delete_case_study', {
				targetId: id,
				data: deletedCS
			});

			return { status: 200, message: 'Case study deleted successfully.' };
		} catch (error) {
			return fail(500, { message: 'Could not delete the case study.' });
		}
	}
};