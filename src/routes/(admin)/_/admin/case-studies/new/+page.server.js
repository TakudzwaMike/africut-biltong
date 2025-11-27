import { db } from '$lib/server/db';
import { caseStudy, caseStudyResult, client } from '$lib/server/db/schema.js';
import { fail, redirect, error } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import { log } from '$lib/server/auditLog.js';

const ALLOWED_ROLES = ['admin', 'content_editor'];

export async function load({ locals }) {
	// 1. Security Check
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden: You do not have permission to create case studies.');
	}

	const clients = await db.query.client.findMany({
		orderBy: desc(client.name)
	});
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
			const [newCaseStudy] = await db
				.insert(caseStudy)
				.values({
					title: String(title),
					slug: String(slug),
					clientId: clientId ? Number(clientId) : null,
					challenge,
					solution
				})
				.returning();

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
						caseStudyId: newCaseStudy.id,
						kpiName: r.name,
						kpiValue: r.value
					}));

				if (resultsToInsert.length > 0) {
					await db.insert(caseStudyResult).values(resultsToInsert);
				}
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