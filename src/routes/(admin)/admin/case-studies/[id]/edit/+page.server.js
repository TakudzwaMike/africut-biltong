import { db } from '$lib/server/db';
import { caseStudy, caseStudyResult, client } from '$lib/server/db/schema.js';
import { fail, redirect, error } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import { log } from '$lib/server/auditLog.js';

const toRichText = (text) => {
	if (!text) return [];
	return [{ type: 'paragraph', children: [{ text: String(text) }] }];
};

const fromRichText = (richText) => {
	if (!richText || !Array.isArray(richText) || richText.length === 0) return '';
	return richText.map((p) => p.children.map((c) => c.text).join('')).join('\n\n');
};

export async function load({ params }) {
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

	return {
		caseStudy: {
			...cs,
			challenge: fromRichText(cs.challenge),
			solution: fromRichText(cs.solution)
		},
		clients
	};
}

export const actions = {
	default: async ({ request, params, locals }) => {
		const id = Number(params.id);
		const formData = await request.formData();
		const data = Object.fromEntries(formData);
		const { title, slug, clientId, challenge, solution } = data;

		if (!title || !slug) {
			return fail(400, { data, message: 'Title and Slug are required.' });
		}

		try {
			let resultsToInsert = [];
			const dataToUpdate = {
				title: String(title),
				slug: String(slug),
				clientId: clientId ? Number(clientId) : null,
				challenge: toRichText(challenge),
				solution: toRichText(solution)
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

		throw redirect(302, '/admin/case-studies');
	}
};