import { pgTable, text, timestamp, serial, varchar, jsonb, integer, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const testimonialStatusEnum = pgEnum('testimonial_status', [
	'pending',
	'submitted',
	'published',
	'rejected'
]);

export const userTable = pgTable('user', {
	id: text('id').primaryKey(),
	username: varchar('username', { length: 255 }).notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const sessionTable = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => userTable.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const client = pgTable('client', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull().unique(),
	logoUrl: text('logo_url')
});

export const solution = pgTable('solution', {
	id: serial('id').primaryKey(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	solutionName: varchar('solution_name', { length: 255 }).notNull(),
	imageUrl: text('image_url'),
	shortDescription: text('short_description'),
	longDescription: jsonb('long_description'),
	ctaText: varchar('cta_text', { length: 255 }),
	ctaLink: varchar('cta_link', { length: 255 })
});

export const caseStudy = pgTable('case_study', {
	id: serial('id').primaryKey(),
	clientId: integer('client_id').references(() => client.id, { onDelete: 'set null' }),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	title: varchar('title', { length: 255 }).notNull(),
	challenge: jsonb('challenge').notNull(),
	solution: jsonb('solution').notNull()
});

export const caseStudyResult = pgTable('case_study_result', {
	id: serial('id').primaryKey(),
	caseStudyId: integer('case_study_id')
		.notNull()
		.references(() => caseStudy.id, { onDelete: 'cascade' }),
	kpiName: varchar('kpi_name', { length: 255 }).notNull(),
	kpiValue: varchar('kpi_value', { length: 255 }).notNull()
});

export const testimonial = pgTable('testimonial', {
	id: serial('id').primaryKey(),
	clientId: integer('client_id')
		.notNull()
		.references(() => client.id, { onDelete: 'cascade' }),
	quote: text('quote'),
	authorName: varchar('author_name', { length: 255 }),
	authorTitle: varchar('author_title', { length: 255 }),
	status: testimonialStatusEnum('status').notNull().default('pending'),
	submissionToken: text('submission_token').notNull().unique(),
	tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const media = pgTable('media', {
	id: serial('id').primaryKey(),
	url: text('url').notNull(),
	altText: varchar('alt_text', { length: 255 }).notNull(),
	uploadedAt: timestamp('uploaded_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const blogPost = pgTable('blog_post', {
	id: serial('id').primaryKey(),
	authorId: text('author_id')
		.notNull()
		.references(() => userTable.id, { onDelete: 'cascade' }),
	mediaId: integer('media_id').references(() => media.id, { onDelete: 'set null' }),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	title: varchar('title', { length: 255 }).notNull(),
	contentJson: jsonb('content_json'),
	isPublished: boolean('is_published').notNull().default(false),
	publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const blogCategory = pgTable('blog_category', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull().unique()
});

export const blogPostsToCategories = pgTable('blog_posts_to_categories', {
	postId: integer('post_id')
		.notNull()
		.references(() => blogPost.id, { onDelete: 'cascade' }),
	categoryId: integer('category_id')
		.notNull()
		.references(() => blogCategory.id, { onDelete: 'cascade' })
});

export const lead = pgTable('lead', {
	id: serial('id').primaryKey(),
	solutionId: integer('solution_id').references(() => solution.id, { onDelete: 'set null' }),
	firstName: varchar('first_name', { length: 255 }),
	lastName: varchar('last_name', { length: 255 }),
	email: varchar('email', { length: 255 }).notNull(),
	message: text('message'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const siteSettings = pgTable('site_setting', {
	key: varchar('key', { length: 255 }).primaryKey(),
	value: text('value')
});

export const location = pgTable('location', {
	id: serial('id').primaryKey(),
	countryName: varchar('country_name', { length: 255 }).notNull(),
	countryCode: varchar('country_code', { length: 2 }).notNull(), // For geo-targeting (e.g., ZW, ZA)
	address: text('address').notNull(),
	phoneNumber: varchar('phone_number', { length: 255 }),
	latitude: varchar('latitude', { length: 255 }),
	longitude: varchar('longitude', { length: 255 })
});

export const product = pgTable('product', {
	id: serial('id').primaryKey(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	name: varchar('name', { length: 255 }).notNull(),
	imageUrl: text('image_url'),
	shortDescription: text('short_description'),
	longDescription: jsonb('long_description'),
	ctaText: varchar('cta_text', { length: 255 }),
	ctaLink: varchar('cta_link', { length: 255 })
});

export const auditLog = pgTable('audit_log', {
	id: serial('id').primaryKey(),
	userId: text('user_id').references(() => userTable.id, { onDelete: 'set null' }),
	action: varchar('action', { length: 255 }).notNull(), // e.g., 'create_product', 'delete_client'
	targetId: varchar('target_id', { length: 255 }), // e.g., the ID of the product that was created
	data: jsonb('data'), // A snapshot of the created/updated/deleted data
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const pageContent = pgTable('page_content', {
	id: serial('id').primaryKey(),
	page: varchar('page', { length: 255 }).notNull(), // e.g., 'homepage'
	section: varchar('section', { length: 255 }).notNull().unique(), // e.g., 'technology_teaser'
	title: varchar('title', { length: 255 }),
	text: text('text'),
	mediaId: integer('media_id').references(() => media.id, { onDelete: 'set null' })
});

export const teamMember = pgTable('team_member', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	title: varchar('title', { length: 255 }).notNull(),
	bio: text('bio'),
	mediaId: integer('media_id').references(() => media.id, { onDelete: 'set null' })
});

export const userRelations = relations(userTable, ({ many }) => ({
	blogPosts: many(blogPost),
	auditLogs: many(auditLog)
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
	user: one(userTable, {
		fields: [auditLog.userId],
		references: [userTable.id]
	})
}));

export const pageContentRelations = relations(pageContent, ({ one }) => ({
	media: one(media, {
		fields: [pageContent.mediaId],
		references: [media.id]
	})
}));

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
	photo: one(media, {
		fields: [teamMember.mediaId],
		references: [media.id]
	})
}));

export const blogPostRelations = relations(blogPost, ({ one, many }) => ({
	author: one(userTable, {
		fields: [blogPost.authorId],
		references: [userTable.id]
	}),
	featuredImage: one(media, {
		fields: [blogPost.mediaId],
		references: [media.id]
	}),
	categories: many(blogPostsToCategories)
}));

export const blogCategoryRelations = relations(blogCategory, ({ many }) => ({
	posts: many(blogPostsToCategories)
}));

export const blogPostsToCategoriesRelations = relations(blogPostsToCategories, ({ one }) => ({
	post: one(blogPost, {
		fields: [blogPostsToCategories.postId],
		references: [blogPost.id]
	}),
	category: one(blogCategory, {
		fields: [blogPostsToCategories.categoryId],
		references: [blogCategory.id]
	})
}));

export const clientRelations = relations(client, ({ many }) => ({
	caseStudies: many(caseStudy),
	testimonials: many(testimonial)
}));

export const leadRelations = relations(lead, ({ one }) => ({
	solution: one(solution, {
		fields: [lead.solutionId],
		references: [solution.id]
	})
}));

export const testimonialRelations = relations(testimonial, ({ one }) => ({
	client: one(client, {
		fields: [testimonial.clientId],
		references: [client.id]
	})
}));

export const caseStudyRelations = relations(caseStudy, ({ one, many }) => ({
	results: many(caseStudyResult),
	client: one(client, {
		fields: [caseStudy.clientId],
		references: [client.id]
	})
}));

export const caseStudyResultRelations = relations(caseStudyResult, ({ one }) => ({
	caseStudy: one(caseStudy, {
		fields: [caseStudyResult.caseStudyId],
		references: [caseStudy.id]
	})
}));
