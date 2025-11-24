import { pgTable, text, timestamp, serial, varchar, jsonb, integer, pgEnum, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- ENUMS ---
export const testimonialStatusEnum = pgEnum('testimonial_status', [
	'pending',
	'submitted',
	'published',
	'rejected'
]);
export const productTypeEnum = pgEnum('product_type', ['physical', 'service', 'digital']);
export const leadStatusEnum = pgEnum('lead_status', ['new', 'contacted', 'qualified', 'lost', 'closed']);

// --- AUTH ---
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
export const media = pgTable('media', {
	id: serial('id').primaryKey(),
	altText: varchar('alt_text', { length: 255 }).notNull(),
	originalUrl: text('original_url').notNull(),
	width: integer('width').notNull(),
	height: integer('height').notNull(),
	thumbnailUrl: text('thumbnail_url'),
	displayUrl: text('display_url'),
	blurDataUrl: text('blur_data_url'),
	uploadedAt: timestamp('uploaded_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const client = pgTable('client', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull().unique(),
	mediaId: integer('media_id').references(() => media.id, { onDelete: 'set null' })
});

export const solution = pgTable('solution', {
	id: serial('id').primaryKey(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	solutionName: varchar('solution_name', { length: 255 }).notNull(),
	mediaId: integer('media_id').references(() => media.id, { onDelete: 'set null' }),
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

// --- LEADS ---
export const lead = pgTable('lead', {
	id: serial('id').primaryKey(),
	solutionId: integer('solution_id').references(() => solution.id, { onDelete: 'set null' }),
	firstName: varchar('first_name', { length: 255 }),
	lastName: varchar('last_name', { length: 255 }),
	email: varchar('email', { length: 255 }).notNull(),
	message: text('message'),
	status: leadStatusEnum('status').default('new').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

// --- SITE SETTINGS ---
export const siteSettings = pgTable('site_setting', {
	key: varchar('key', { length: 255 }).primaryKey(),
	value: text('value')
});

// --- LOCATIONS ---
export const location = pgTable('location', {
	id: serial('id').primaryKey(),
	countryName: varchar('country_name', { length: 255 }).notNull(),
	countryCode: varchar('country_code', { length: 2 }).notNull(),
	address: text('address').notNull(),
	phoneNumber: varchar('phone_number', { length: 255 }),
	latitude: varchar('latitude', { length: 255 }),
	longitude: varchar('longitude', { length: 255 })
});

// --- STORE / PRODUCTS ---
export const product = pgTable('product', {
	id: serial('id').primaryKey(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	name: varchar('name', { length: 255 }).notNull(),
	mediaId: integer('media_id').references(() => media.id, { onDelete: 'set null' }),
	shortDescription: text('short_description'),
	longDescription: jsonb('long_description'),
	ctaText: varchar('cta_text', { length: 255 }),
	ctaLink: varchar('cta_link', { length: 255 }),
	type: productTypeEnum('type').notNull().default('physical'),
	prices: jsonb('prices'),
	stockQuantity: integer('stock_quantity')
});

// NEW: Many-to-Many Link Table
export const solutionsToProducts = pgTable('solutions_to_products', {
	solutionId: integer('solution_id')
		.notNull()
		.references(() => solution.id, { onDelete: 'cascade' }),
	productId: integer('product_id')
		.notNull()
		.references(() => product.id, { onDelete: 'cascade' }),
}, (t) => ({
	pk: primaryKey({ columns: [t.solutionId, t.productId] }),
}));

export const productImage = pgTable('product_image', {
	id: serial('id').primaryKey(),
	productId: integer('product_id').notNull().references(() => product.id, { onDelete: 'cascade' }),
	mediaId: integer('media_id').notNull().references(() => media.id, { onDelete: 'cascade' }),
	displayOrder: integer('display_order').notNull().default(0)
});

export const order = pgTable('order', {
	id: serial('id').primaryKey(),
	customerName: varchar('customer_name', { length: 255 }).notNull(),
	customerEmail: varchar('customer_email', { length: 255 }).notNull(),
	totalAmount: integer('total_amount').notNull(),
	currency: varchar('currency', { length: 3 }).notNull(),
	status: varchar('status', { length: 50 }).notNull().default('pending'),
	stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }).unique(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const orderItem = pgTable('order_item', {
	id: serial('id').primaryKey(),
	orderId: integer('order_id').notNull().references(() => order.id, { onDelete: 'cascade' }),
	productId: integer('product_id').references(() => product.id, { onDelete: 'set null' }),
	quantity: integer('quantity').notNull(),
	priceAtPurchase: integer('price_at_purchase').notNull()
});

// --- AUDIT LOG ---
export const auditLog = pgTable('audit_log', {
	id: serial('id').primaryKey(),
	userId: text('user_id').references(() => userTable.id, { onDelete: 'set null' }),
	action: varchar('action', { length: 255 }).notNull(),
	targetId: varchar('target_id', { length: 255 }),
	data: jsonb('data'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

// --- PAGE CONTENT ---
export const pageContent = pgTable('page_content', {
	id: serial('id').primaryKey(),
	page: varchar('page', { length: 255 }).notNull(),
	section: varchar('section', { length: 255 }).notNull().unique(),
	title: varchar('title', { length: 255 }),
	text: text('text'),
	mediaId: integer('media_id').references(() => media.id, { onDelete: 'set null' })
});

// --- USER INVITES ---
export const userInvite = pgTable('user_invite', {
	id: serial('id').primaryKey(),
	token: text('token').notNull().unique(),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
	usedAt: timestamp('used_at', { withTimezone: true, mode: 'date' }),
	createdBy: text('created_by').references(() => userTable.id, { onDelete: 'set null' })
});

// --- TEAM MEMBERS ---
export const teamMember = pgTable('team_member', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	title: varchar('title', { length: 255 }).notNull(),
	bio: text('bio'),
	mediaId: integer('media_id').references(() => media.id, { onDelete: 'set null' })
});

// --- DOCUMENTS ---
export const document = pgTable('document', {
	id: serial('id').primaryKey(),
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	fileUrl: text('file_url').notNull(),
	isGated: boolean('is_gated').default(false).notNull(),
	thumbnailMediaId: integer('thumbnail_media_id').references(() => media.id, {
		onDelete: 'set null'
	}),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const gatedDocumentLead = pgTable('gated_document_lead', {
	id: serial('id').primaryKey(),
	documentId: integer('document_id')
		.notNull()
		.references(() => document.id, { onDelete: 'cascade' }),
	email: varchar('email', { length: 255 }).notNull(),
	submittedAt: timestamp('submitted_at').defaultNow().notNull()
});

// --- QR CODES ---
export const trackedLink = pgTable('tracked_link', {
	id: serial('id').primaryKey(),
	shortCode: varchar('short_code', { length: 255 }).notNull().unique(),
	destinationUrl: text('destination_url').notNull(),
	description: varchar('description', { length: 255 }),
	userId: text('user_id')
		.notNull()
		.references(() => userTable.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const linkVisit = pgTable('link_visit', {
	id: serial('id').primaryKey(),
	linkId: integer('link_id')
		.notNull()
		.references(() => trackedLink.id, { onDelete: 'cascade' }),
	ipCountry: varchar('ip_country', { length: 2 }),
	visitedAt: timestamp('visited_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

// --- RELATIONS ---
export const userRelations = relations(userTable, ({ many }) => ({
	blogPosts: many(blogPost),
	auditLogs: many(auditLog),
	trackedLinks: many(trackedLink)
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

export const documentRelations = relations(document, ({ one }) => ({
	thumbnail: one(media, {
		fields: [document.thumbnailMediaId],
		references: [media.id]
	})
}));

// Updated to include relation to Solutions
export const productRelations = relations(product, ({ one, many }) => ({
	featuredImage: one(media, {
		fields: [product.mediaId],
		references: [media.id]
	}),
	orderItems: many(orderItem),
	galleryImages: many(productImage),
	solutions: many(solutionsToProducts)
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

export const clientRelations = relations(client, ({ many, one }) => ({
	caseStudies: many(caseStudy),
	testimonials: many(testimonial),
	logo: one(media, {
		fields: [client.mediaId],
		references: [media.id]
	})
}));

export const leadRelations = relations(lead, ({ one }) => ({
	solution: one(solution, {
		fields: [lead.solutionId],
		references: [solution.id]
	})
}));

// Updated to include relation to Products
export const solutionRelations = relations(solution, ({ one, many }) => ({
	featuredImage: one(media, {
		fields: [solution.mediaId],
		references: [media.id]
	}),
	products: many(solutionsToProducts)
}));

// NEW Relation Definition
export const solutionsToProductsRelations = relations(solutionsToProducts, ({ one }) => ({
	solution: one(solution, {
		fields: [solutionsToProducts.solutionId],
		references: [solution.id],
	}),
	product: one(product, {
		fields: [solutionsToProducts.productId],
		references: [product.id],
	}),
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

export const trackedLinkRelations = relations(trackedLink, ({ one, many }) => ({
	user: one(userTable, {
		fields: [trackedLink.userId],
		references: [userTable.id]
	}),
	visits: many(linkVisit)
}));

export const linkVisitRelations = relations(linkVisit, ({ one }) => ({
	link: one(trackedLink, {
		fields: [linkVisit.linkId],
		references: [trackedLink.id]
	})
}));

export const userInviteRelations = relations(userInvite, ({ one }) => ({
	creator: one(userTable, {
		fields: [userInvite.createdBy],
		references: [userTable.id]
	})
}));

export const orderRelations = relations(order, ({ many }) => ({
	items: many(orderItem)
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
	order: one(order, {
		fields: [orderItem.orderId],
		references: [order.id]
	}),
	product: one(product, {
		fields: [orderItem.productId],
		references: [product.id]
	})
}));

export const productImageRelations = relations(productImage, ({ one }) => ({
	product: one(product, {
		fields: [productImage.productId],
		references: [product.id]
	}),
	media: one(media, {
		fields: [productImage.mediaId],
		references: [media.id]
	})
}));

export const gatedDocumentLeadRelations = relations(gatedDocumentLead, ({ one }) => ({
	document: one(document, {
		fields: [gatedDocumentLead.documentId],
		references: [document.id]
	})
}));