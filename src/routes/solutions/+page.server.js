import { db } from '$lib/server/db';

export async function load() {
	const solutions = await db.query.solution.findMany();
	return { solutions };
}