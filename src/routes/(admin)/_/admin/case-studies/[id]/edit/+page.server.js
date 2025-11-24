import { db } from '$lib/server/db';
import { caseStudy, caseStudyResult, client } from '$lib/server/db/schema.js';
import { fail, redirect, error } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import { log } from '$lib/server/auditLog.js';

const ALLOWED_ROLES = ['admin', 'content_editor'];

export async function load({ params, locals }) {
	// 1. Security Check
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden: You do not have permission to edit case studies.');
	}

	const id = Number(params.id);
	if (isNaN(id)) {
		throw error(404, 'Not found');
	}

	const cs = await db.query.caseStudy.findFirst({
		where: eq(caseStudy.id, id),
		with: {
			results: true
		}
	});

	if (!cs) {
		throw error(404, 'Not found');
	}

	const clients = await db.query.client.findMany({
		orderBy: desc(client.name)
	});

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
			let resultsToInsert = [];
			const dataToUpdate = {
				title: String(title),
				slug: String(slug),
				clientId: clientId ? Number(clientId) : null,
				challenge,
				solution
			};

			await db.transaction(async (tx) => {
				await tx.update(caseStudy).set(dataToUpdate).where(eq(caseStudy.id, id));

				await tx.delete(caseStudyResult).where(eq(caseStudyResult.caseStudyId, id));

				const kpiNames = formData.getAll('kpiName');
				const kpiValues = formData.getAll('kpiValue');

				resultsToInsert = kpiNames
					.map((name, index) => ({
						name: String(name),
						value: String(kpiValues[index])
					}))
					.filter((r) => r.name && r.value)
					.map((r) => ({
						caseStudyId: id,
						kpiName: r.name,
						kpiValue: r.value
					}));

				if (resultsToInsert.length > 0) {
					await tx.insert(caseStudyResult).values(resultsToInsert);
				}
			});

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