import { fail, error } from '@sveltejs/kit';
import { ALLOWED_ROLES } from '$lib/server/services/AuthService';
import { log } from '$lib/server/services/AuditLogService';
import { CaseStudyService } from '$lib/server/services/CaseStudyService';

const caseStudyService = new CaseStudyService();

export async function load({ params, locals }) {
	// 1. Security Check
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden: You do not have permission to edit case studies.');
	}

	const id = Number(params.id);
	if (isNaN(id)) {
		throw error(404, 'Not found');
	}

	const cs = await caseStudyService.getCaseStudyById(id);

	const clients = await caseStudyService.listClients();

	return { caseStudy: cs, clients };
}

export const actions = {
	default: async ({ request, params, locals }) => {
		// 2. Security Check
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const id = Number(params.id);
		const formData = await request.formData();
		const data = Object.fromEntries(formData);
		const { title, slug, clientId, challenge: challengeJson, solution: solutionJson } = data;

		if (!title || !slug) {
			return fail(400, { data, message: 'Title and Slug are required.' });
		}

		let challenge, solution;
		try {
			challenge = challengeJson ? JSON.parse(String(challengeJson)) : null;
			solution = solutionJson ? JSON.parse(String(solutionJson)) : null;
		} catch (e) {
			return fail(400, { data, message: 'Invalid rich text format for challenge or solution.' });
		}

		try {
			const dataToUpdate = {
				title: String(title),
				slug: String(slug),
				clientId: clientId ? Number(clientId) : null,
				challenge,
				solution
			};

			const kpiNames = formData.getAll('kpiName');
			const kpiValues = formData.getAll('kpiValue');
			let resultsToInsert = [];

			resultsToInsert = kpiNames
				.map((name, index) => ({
					name: String(name),
					value: String(kpiValues[index])
				}))
				.filter((r) => r.name && r.value)
				.map((r) => ({
					kpiName: r.name,
					kpiValue: r.value
				}));

			// Use the new service method that handles proper transaction update
			await caseStudyService.updateCaseStudyWithResults(locals.user.id, id, dataToUpdate, resultsToInsert);

			await log(locals.user?.id, 'update_case_study', {
				targetId: id,
				data: { ...dataToUpdate, results: resultsToInsert }
			});
		} catch (error) {
			console.error('Error updating case study:', error);
			if (error.message.includes('duplicate key value violates unique constraint')) {
				return fail(400, { data, message: 'This slug is already in use. Please choose another.' });
			}
			return fail(500, { data, message: 'Could not update the case study.' });
		}

		throw redirect(302, '/_/admin/case-studies');
	}
};