import { db } from '$lib/server/db';
import { pageContent, teamMember } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function load() {
	const contentList = await db.query.pageContent.findMany({
		where: eq(pageContent.page, 'about'),
		with: {
			media: true
		}
	});

	const content = contentList.reduce((acc, item) => {
		acc[item.section] = item;
		return acc;
	}, {});

	const teamMembers = await db.query.teamMember.findMany({
		orderBy: desc(teamMember.id),
		with: {
			photo: true
		}
	});

	return { content, teamMembers };
}