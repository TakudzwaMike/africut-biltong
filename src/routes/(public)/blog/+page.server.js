import { BlogService } from '$lib/server/services/BlogService';

export async function load() {
	const service = new BlogService();
	const result = await service.listPosts({ publishedOnly: true });
	// BlogRepository.findMany returns { posts, ... }
	const posts = result.posts || [];

	return { posts };
}