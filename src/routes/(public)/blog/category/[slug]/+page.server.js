import { BlogService } from '$lib/server/services/BlogService';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const { slug } = params;

	const blogService = new BlogService();

	// Find the category by its slug
	const category = await blogService.getCategoryBySlug(slug);

	if (!category) {
		throw error(404, 'Category not found');
	}

	// Find all posts in this category
	const posts = await blogService.getPostsByCategory(category.id);

	return { category, posts };
}