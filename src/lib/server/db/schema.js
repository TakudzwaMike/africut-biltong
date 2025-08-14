import { pgTable, text, timestamp, serial, varchar, jsonb, integer, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- ENUMS ---
export const testimonialStatusEnum = pgEnum('testimonial_status', [
	'pending',
	'submitted',
	'published',
	'rejected'
]);

// --- AUTH (compatible with Lucia-auth) ---
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

// --- CONTENT ---
export const client = pgTable('client', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull().unique(),
	logoUrl: text('logo_url') // URL to the logo in S3/Minio
});

export const solution = pgTable('solution', {
	id: serial('id').primaryKey(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	solutionName: varchar('solution_name', { length: 255 }).notNull(),
	imageUrl: text('image_url'),
	shortDescription: text('short_description'),
	longDescription: jsonb('long_description') // For rich text content
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

export const blogPost = pgTable('blog_post', {
	id: serial('id').primaryKey(),
	authorId: text('author_id')
		.notNull()
		.references(() => userTable.id, { onDelete: 'cascade' }),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	title: varchar('title', { length: 255 }).notNull(),
	contentJson: jsonb('content_json'),
	isPublished: boolean('is_published').notNull().default(false),
	publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

// --- LEADS (from contact form) ---
export const lead = pgTable('lead', {
	id: serial('id').primaryKey(),
	solutionId: integer('solution_id').references(() => solution.id, { onDelete: 'set null' }),
	firstName: varchar('first_name', { length: 255 }),
	lastName: varchar('last_name', { length: 255 }),
	email: varchar('email', { length: 255 }).notNull(),
	message: text('message'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

// --- RELATIONS for Drizzle Kit ---
export const userRelations = relations(userTable, ({ many }) => ({
	blogPosts: many(blogPost)
}));

export const blogPostRelations = relations(blogPost, ({ one }) => ({
	author: one(userTable, {
		fields: [blogPost.authorId],
		references: [userTable.id]
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