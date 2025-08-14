import { db } from '$lib/server/db';
import { caseStudy, caseStudyResult, client } from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';

const toRichText = (text) => {
	if (!text) return [];
	return [{ type: 'paragraph', children: [{ text: String(text) }] }];
};

export async function load() {
	const clients = await db.query.client.findMany({
		orderBy: desc(client.name)
	});
	return { clients };
}

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		const { title, slug, clientId, challenge, solution } = data;

		if (!title || !slug) {
			return fail(400, { data, message: 'Title and Slug are required.' });
		}

		try {
			const [newCaseStudy] = await db
				.insert(caseStudy)
				.values({
					title: String(title),
					slug: String(slug),
					clientId: clientId ? Number(clientId) : null,
					challenge: toRichText(challenge),
					solution: toRichText(solution)
				})
				.returning({ id: caseStudy.id });

			const kpiNames = formData.getAll('kpiName');
			const kpiValues = formData.getAll('kpiValue');

			if (kpiNames.length > 0) {
				const resultsToInsert = kpiNames
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
		} catch (error) {
			console.error('Error creating case study:', error);
			if (error.message.includes('duplicate key value violates unique constraint')) {
				return fail(400, { data, message: 'This slug is already in use. Please choose another.' });
			}
			return fail(500, { data, message: 'Could not create the case study.' });
		}

		throw redirect(302, '/admin/case-studies');
	}
};