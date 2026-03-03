import { db } from '$lib/server/db';
import { blogPost, blogCategory, blogPostsToCategories, media } from '$lib/server/db/schema.js';
import { desc, eq, or, ilike, and, count } from 'drizzle-orm';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('BlogRepository');

export class BlogRepository {
    async findMany({ page = 1, limit = 20, query = '', publishedOnly = false } = {}) {
        const offset = (page - 1) * limit;

        const conditions = [];
        if (query) {
            const searchStr = `%${query}%`;
            conditions.push(or(
                ilike(blogPost.title, searchStr),
                ilike(blogPost.slug, searchStr)
            ));
        }
        if (publishedOnly) {
            conditions.push(eq(blogPost.isPublished, true));
        }

        const filters = conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : and(...conditions)) : undefined;

        const [posts, totalResult] = await Promise.all([
            db.query.blogPost.findMany({
                where: filters,
                orderBy: desc(blogPost.createdAt),
                with: {
                    author: {
                        columns: { username: true }
                    },
                    featuredImage: true,
                    categories: {
                        with: { category: true }
                    }
                },
                limit,
                offset
            }),
            db.select({ count: count() }).from(blogPost).where(filters)
        ]);

        const totalItems = totalResult[0].count;
        const totalPages = Math.ceil(totalItems / limit);

        return { posts, totalItems, totalPages };
    }

    async count() {
        const result = await db.select({ count: count() }).from(blogPost);
        return result[0]?.count || 0;
    }

    async findById(id) {
        return db.query.blogPost.findFirst({
            where: eq(blogPost.id, id),
            with: {
                featuredImage: true,
                categories: {
                    with: { category: true }
                }
            }
        });
    }

    async create(data) {
        try {
            const { categoryIds, ...postData } = data;
            const [newPost] = await db.insert(blogPost).values(postData).returning();

            // Handle categories if provided
            if (categoryIds && categoryIds.length > 0) {
                await db.insert(blogPostsToCategories).values(
                    categoryIds.map((catId) => ({
                        postId: newPost.id,
                        categoryId: catId
                    }))
                );
            }

            logger.info(`Created blog post: ${newPost.id}`);
            return newPost;
        } catch (error) {
            logger.error('Error creating blog post', error);
            throw error;
        }
    }

    async update(id, data) {
        try {
            const [updated] = await db.update(blogPost).set(data).where(eq(blogPost.id, id)).returning();
            logger.info(`Updated blog post: ${id}`);
            return updated;
        } catch (error) {
            logger.error(`Error updating blog post ${id}`, error);
            throw error;
        }
    }

    async updateWithCategories(id, data, categoryIds) {
        try {
            await db.transaction(async (tx) => {
                await tx.update(blogPost).set(data).where(eq(blogPost.id, id));

                // Sync categories
                await tx.delete(blogPostsToCategories).where(eq(blogPostsToCategories.postId, id));
                if (categoryIds && categoryIds.length > 0) {
                    await tx.insert(blogPostsToCategories).values(
                        categoryIds.map((catId) => ({
                            postId: id,
                            categoryId: catId
                        }))
                    );
                }
            });

            logger.info(`Updated blog post with categories: ${id}`);
        } catch (error) {
            logger.error(`Error updating blog post ${id} with categories`, error);
            throw error;
        }
    }

    async listCategories() {
        return db.query.blogCategory.findMany({
            orderBy: desc(blogCategory.name)
        });
    }

    async createCategory(data) {
        try {
            const [newCategory] = await db.insert(blogCategory).values(data).returning();
            logger.info(`Created blog category: ${newCategory.id}`);
            return newCategory;
        } catch (error) {
            logger.error('Error creating blog category', error);
            throw error;
        }
    }

    async deleteCategory(id) {
        try {
            const catToDelete = await db.query.blogCategory.findFirst({
                where: eq(blogCategory.id, id)
            });

            if (!catToDelete) return null;

            await db.delete(blogCategory).where(eq(blogCategory.id, id));
            logger.info(`Deleted blog category: ${id}`);
            return catToDelete;
        } catch (error) {
            logger.error(`Error deleting blog category ${id}`, error);
            throw error;
        }
    }

    async findBySlug(slug) {
        return db.query.blogPost.findFirst({
            where: and(eq(blogPost.slug, slug), eq(blogPost.isPublished, true)),
            with: {
                author: {
                    columns: { username: true }
                },
                featuredImage: true,
                categories: {
                    with: { category: true }
                }
            }
        });
    }

    async findCategoryBySlug(slug) {
        return db.query.blogCategory.findFirst({
            where: eq(blogCategory.slug, slug)
        });
    }

    async findPostsByCategory(categoryId) {
        return db.query.blogPost.findMany({
            where: and(
                eq(blogPost.isPublished, true)
            ),
            with: {
                author: { columns: { username: true } },
                featuredImage: true,
                categories: {
                    where: eq(blogPostsToCategories.categoryId, categoryId),
                    with: { category: true }
                }
            },
            orderBy: desc(blogPost.publishedAt)
        });
    }

    async listMedia() {
        return db.query.media.findMany({
            orderBy: desc(media.uploadedAt)
        });
    }

    async delete(id) {
        try {
            const postToDelete = await db.query.blogPost.findFirst({
                where: eq(blogPost.id, id)
            });

            if (!postToDelete) return null;

            await db.delete(blogPost).where(eq(blogPost.id, id));
            logger.info(`Deleted blog post: ${id}`);
            return postToDelete;
        } catch (error) {
            logger.error(`Error deleting blog post ${id}`, error);
            throw error;
        }
    }
}
