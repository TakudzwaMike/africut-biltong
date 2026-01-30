import { fail, error } from '@sveltejs/kit';
import { ALLOWED_ROLES } from '$lib/server/services/AuthService';
import { log } from '$lib/server/services/AuditLogService';
import { CaseStudyService } from '$lib/server/services/CaseStudyService';

const caseStudyService = new CaseStudyService();

export async function load({ locals }) {
	// 1. Security Check
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden: You do not have permission to create case studies.');
	}

	const clients = await caseStudyService.listClients();
	return { clients };
}

export const actions = {
	default: async ({ request, locals }) => {
		// 2. Security Check
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

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
			// Prepare initial data (without results)
			const createData = {
				title: String(title),
				slug: String(slug),
				clientId: clientId ? Number(clientId) : null,
				challenge,
				solution
			};

			// Use Service to create case study
			const newCaseStudy = await caseStudyService.createCaseStudy(locals.user.id, createData);

			// Handle Results (KPIs) - Service method updateWithResults handles formatting if we send array
			// But for creation, we need to do it as a second step or enhance create.
			// Given our service structure, we'll update with results immediately after creation.

			const kpiNames = formData.getAll('kpiName');
			const kpiValues = formData.getAll('kpiValue');
			let resultsToInsert = [];

			if (kpiNames.length > 0) {
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
			}

			if (resultsToInsert.length > 0) {
				await caseStudyService.updateCaseStudyWithResults(locals.user.id, newCaseStudy.id, {}, resultsToInsert);
			}

			await log(locals.user?.id, 'create_case_study', {
				targetId: newCaseStudy.id,
				data: { ...newCaseStudy, results: resultsToInsert }
			});
		} catch (error) {
			console.error('Error creating case study:', error);
			if (error.message.includes('duplicate key value violates unique constraint')) {
				return fail(400, { data, message: 'This slug is already in use. Please choose another.' });
			}
			return fail(500, { data, message: 'Could not create the case study.' });
		}

		throw redirect(302, '/_/admin/case-studies');
	}
};