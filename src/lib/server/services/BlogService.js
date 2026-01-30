import { BlogRepository } from '$lib/server/repositories/BlogRepository';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('BlogService');

export class BlogService {
    constructor() {
        this.repo = new BlogRepository();
    }

    async listPosts(params) {
        return this.repo.findMany(params);
    }

    async getPost(id) {
        const post = await this.repo.findById(id);
        if (!post) throw new Error('Post not found');
        return post;
    }

    async createPost(userId, data) {
        try {
            const post = await this.repo.create(data);
            logger.info(`User ${userId} created blog post ${post.id}`);
            return post;
        } catch (err) {
            logger.error('Error creating blog post', err);
            throw err;
        }
    }

    async updatePost(userId, id, data) {
        try {
            const result = await this.repo.update(id, data);
            logger.info(`User ${userId} updated blog post ${id}`);
            return result;
        } catch (err) {
            logger.error(`Error updating blog post ${id}`, err);
            throw err;
        }
    }

    async deletePost(userId, id) {
        try {
            await this.repo.delete(id);
            logger.info(`User ${userId} deleted blog post ${id}`);
        } catch (err) {
            logger.error(`Error deleting blog post ${id}`, err);
            throw err;
        }
    }

    async listCategories() {
        return this.repo.listCategories();
    }

    async createCategory(userId, data) {
        try {
            const category = await this.repo.createCategory(data);
            logger.info(`User ${userId} created blog category ${category.id}`);
            return category;
        } catch (err) {
            logger.error('Error creating blog category', err);
            throw err;
        }
    }

    async deleteCategory(userId, id) {
        try {
            const deleted = await this.repo.deleteCategory(id);
            logger.info(`User ${userId} deleted blog category ${id}`);
            return deleted;
        } catch (err) {
            logger.error(`Error deleting blog category ${id}`, err);
            throw err;
        }
    }

    async updatePostWithCategories(userId, id, data, categoryIds) {
        try {
            await this.repo.updateWithCategories(id, data, categoryIds);
            logger.info(`User ${userId} updated blog post ${id} with categories`);
        } catch (err) {
            logger.error(`Error updating blog post ${id} with categories`, err);
            throw err;
        }
    }

    async listMedia() {
        return this.repo.listMedia();
    }

    async getPostBySlug(slug) {
        return this.repo.findBySlug(slug);
    }
}
