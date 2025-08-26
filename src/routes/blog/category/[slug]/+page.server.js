import { db } from '$lib/server/db';
import { blogCategory, blogPost, blogPostsToCategories } from '$lib/server/db/schema.js';
import { desc, eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const { slug } = params;

	// Find the category by its slug
	const category = await db.query.blogCategory.findFirst({
		where: eq(blogCategory.slug, slug)
	});

	if (!category) {
		throw error(404, 'Category not found');
	}

	// Find all posts linked to this category
	const posts = await db
		.select({
			// Select fields from the blogPost table
			id: blogPost.id,
			slug: blogPost.slug,
			title: blogPost.title,
			contentJson: blogPost.contentJson,
			publishedAt: blogPost.publishedAt,
			// Include author username and featured image URL through relations
			author: { username: blogPost.author.username },
			featuredImage: { url: blogPost.featuredImage.url, altText: blogPost.featuredImage.altText }
		})
		.from(blogPost)
		.leftJoin(blogPostsToCategories, eq(blogPost.id, blogPostsToCategories.postId))
		.where(
			and(
				eq(blogPostsToCategories.categoryId, category.id),
				eq(blogPost.isPublished, true)
			)
		)
		.orderBy(desc(blogPost.publishedAt));

	return { category, posts };
}