import { db } from '$lib/server/db';
import { pageContent, media } from '$lib/server/db/schema.js';
import { fail } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import { log } from '$lib/server/auditLog.js';

const EDITABLE_SECTIONS = [
	{
		page: 'homepage',
		section: 'technology',
		title: 'Built on a Foundation of Data and Trust',
		text: 'Our systems are engineered for reliability and precision. We leverage advanced AI and computer vision to detect unsafe conditions, predict equipment failure, and enable autonomous navigation. By processing your existing data streams securely, we deliver insights without disrupting your workflow.'
	},
	{
		page: 'homepage',
		section: 'hero',
		title: 'Transforming Operations with Smart, Simple AI',
		text: 'We provide AI-powered solutions for the mining, construction, and heavy industries, turning your operational data into measurable gains in profitability and sustainability.'
	},
	{
		page: 'about',
		section: 'history',
		title: 'Our Journey: Pioneering Intelligence',
		text: "Our journey began with a simple observation: the mining, construction, and heavy industries are rich with data, but poor in actionable insights. We bridge that gap. Our team of expert engineers, data scientists, and industry veterans develops 'Smart Simple Solutions' that integrate seamlessly into existing operations"
	}
];

async function provisionSections() {
	for (const sectionDefaults of EDITABLE_SECTIONS) {
		const existing = await db.query.pageContent.findFirst({
			where: eq(pageContent.section, sectionDefaults.section)
		});

		if (!existing) {
			await db.insert(pageContent).values(sectionDefaults);
		}
	}
}

export async function load() {
	await provisionSections();

	const content = await db.query.pageContent.findMany({
		with: {
			media: true
		}
	});

	const mediaItems = await db.query.media.findMany({
		orderBy: desc(media.uploadedAt)
	});

	return { content, mediaItems };
}

export const actions = {
	save: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const title = formData.get('title');
		const text = formData.get('text');
		const mediaId = formData.get('mediaId');

		if (isNaN(id)) {
			return fail(400, { message: 'Invalid request' });
		}

		try {
			const dataToUpdate = {
				title: String(title),
				text: String(text),
				mediaId: mediaId ? Number(mediaId) : null
			};

			await db.update(pageContent).set(dataToUpdate).where(eq(pageContent.id, id));

			await log(locals.user?.id, 'update_page_content', {
				targetId: id,
				data: dataToUpdate
			});

			return { success: true, message: 'Content saved successfully!' };
		} catch (error) {
			console.error('Error saving page content:', error);
			return fail(500, { message: 'Could not save content.' });
		}
	}
};
