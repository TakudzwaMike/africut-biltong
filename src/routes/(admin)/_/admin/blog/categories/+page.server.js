import { fail, error } from '@sveltejs/kit';
import { ALLOWED_ROLES } from '$lib/server/services/AuthService';
import { log } from '$lib/server/services/AuditLogService';
import { BlogService } from '$lib/server/services/BlogService';
import { slugify } from '$lib/utils.js';

const blogService = new BlogService();

export async function load({ locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw redirect(302, '/auth/login');
	}

	const categories = await blogService.listCategories();

	return {
		categories
	};
}

export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const formData = await request.formData();
		const name = formData.get('name');

		if (!name || typeof name !== 'string') {
			return fail(400, { name, message: 'Category name is required.' });
		}

		const slug = slugify(name);

		try {
			const newCategory = await blogService.createCategory(locals.user?.id, { name, slug });

			await log(locals.user?.id, 'create_blog_category', {
				targetId: newCategory.id,
				data: newCategory
			});

			return { success: true, message: 'Category created successfully!' };
		} catch (error) {
			console.error('Error creating category:', error);
			if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
				return fail(400, { name, message: 'A category with this name already exists.' });
			}
			return fail(500, { name, message: 'Could not create the category.' });
		}
	},

	delete: async ({ url, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Invalid request' });
		}

		try {
			const deleted = await blogService.deleteCategory(locals.user?.id, Number(id));

			if (!deleted) {
				return fail(404, { message: 'Category not found.' });
			}

			await log(locals.user?.id, 'delete_blog_category', {
				targetId: id,
				data: deleted
			});

			return { success: true, message: 'Category deleted successfully.' };
		} catch (error) {
			console.error('Error deleting category:', error);
			return fail(500, { message: 'Could not delete the category.' });
		}
	}
};
