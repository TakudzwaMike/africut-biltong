import { BlogService } from '$lib/server/services/BlogService';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const { slug } = params;

	const service = new BlogService();
	const post = await service.getPostBySlug(slug);

	if (!post) {
		throw error(404, 'Post not found');
	}

	return { post };
}
