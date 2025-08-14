import { db } from '$lib/server/db';
import { lead as leadTable, solution as solutionTable } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load({ url }) {
	const solutionSlug = url.searchParams.get('solution');
	if (!solutionSlug) {
		return { solution: null };
	}

	const solution = await db.query.solution.findFirst({
		where: eq(solutionTable.slug, solutionSlug)
	});

	return { solution };
}

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		const { firstName, lastName, email, message, solutionId } = data;

		if (!email || !firstName || !lastName || !message) {
			return fail(400, { data, message: 'All fields are required.' });
		}

		try {
			await db.insert(leadTable).values({
				firstName: String(firstName),
				lastName: String(lastName),
				email: String(email),
				message: String(message),
				solutionId: solutionId ? Number(solutionId) : null
			});

			return {
				success: true,
				message: "Thank you! We've received your message and will be in touch shortly."
			};
		} catch (error) {
			console.error('Database error:', error);
			return fail(500, { data, message: 'Could not submit your message due to a server error.' });
		}
	}
};