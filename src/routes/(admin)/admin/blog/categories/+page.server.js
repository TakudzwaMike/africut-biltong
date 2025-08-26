import { db } from '$lib/server/db';
import { blogCategory } from '$lib/server/db/schema.js';
import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { log } from '$lib/server/auditLog.js';
import { slugify } from '$lib/utils.js';

export async function load() {
	const categories = await db.query.blogCategory.findMany({
		orderBy: desc(blogCategory.id)
	});
	return { categories };
}

export const actions = {
	create: async ({ request, locals }) => {
		const formData = await request.formData();
		const name = formData.get('name');

		if (!name || typeof name !== 'string') {
			return fail(400, { name, message: 'Category name is required.' });
		}

		const slug = slugify(name);

		try {
			const [newCategory] = await db
				.insert(blogCategory)
				.values({ name, slug })
				.returning();

			await log(locals.user?.id, 'create_blog_category', {
				targetId: newCategory.id,
				data: newCategory
			});

			return { success: true, message: 'Category created successfully!' };
		} catch (error) {
			console.error('Error creating category:', error);
			if (error.message.includes('duplicate key value violates unique constraint')) {
				return fail(400, { name, message: 'A category with this name already exists.' });
			}
			return fail(500, { name, message: 'Could not create the category.' });
		}
	},

	delete: async ({ url, locals }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Invalid request' });
		}

		try {
			const catToDelete = await db.query.blogCategory.findFirst({
				where: eq(blogCategory.id, Number(id))
			});

			if (!catToDelete) {
				return fail(404, { message: 'Category not found.' });
			}

			await db.delete(blogCategory).where(eq(blogCategory.id, Number(id)));

			await log(locals.user?.id, 'delete_blog_category', {
				targetId: id,
				data: catToDelete
			});

			return { success: true, message: 'Category deleted successfully.' };
		} catch (error) {
			console.error('Error deleting category:', error);
			return fail(500, { message: 'Could not delete the category.' });
		}
	}
};
