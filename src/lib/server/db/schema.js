import { pgTable, text, timestamp, serial, varchar, jsonb, integer, pgEnum, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// --- ENUMS ---
export const testimonialStatusEnum = pgEnum('testimonial_status', ['pending', 'submitted', 'published', 'rejected']);
export const leadStatusEnum = pgEnum('lead_status', ['new', 'contacted', 'qualified', 'lost', 'closed']);
export const productTypeEnum = pgEnum('product_type', ['physical', 'service', 'digital']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'paid', 'shipped', 'delivered', 'cancelled']);
export const userRoleEnum = pgEnum('user_role', ['admin', 'customer', 'store_manager', 'content_editor']);
export const userStatusEnum = pgEnum('user_status', ['pending', 'active', 'disabled']);
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed']);

// --- AUTH & USERS ---
export const userTable = pgTable('user', {
	id: text('id').primaryKey(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	username: varchar('username', { length: 255 }),
	firstName: text('first_name'),
	lastName: text('last_name'),
	passwordHash: text('password_hash').notNull(),
	role: userRoleEnum('role').notNull().default('customer'),
	status: userStatusEnum('status').notNull().default('active'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	inviteToken: text('invite_token'),
	inviteTokenExpiresAt: timestamp('invite_token_expires_at', { withTimezone: true, mode: 'date' }),
});

export const sessionTable = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => userTable.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const userAddress = pgTable('user_address', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	userId: text('user_id').notNull().references(() => userTable.id, { onDelete: 'cascade' }),
	label: text('label').notNull(),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	address: text('address').notNull(),
	city: text('city').notNull(),
	state: text('state').notNull(),
	zipCode: text('zip_code').notNull(),
	country: text('country').notNull(),
	isDefault: boolean('is_default').notNull().default(false),
});

export const passwordResetToken = pgTable('password_reset_token', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => userTable.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

// --- MEDIA (Shared Resource) ---
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

// --- CONTENT TABLES ---

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
	caseStudyId: integer('case_study_id').notNull().references(() => caseStudy.id, { onDelete: 'cascade' }),
	kpiName: varchar('kpi_name', { length: 255 }).notNull(),
	kpiValue: varchar('kpi_value', { length: 255 }).notNull()
});

export const testimonial = pgTable('testimonial', {
	id: serial('id').primaryKey(),
	clientId: integer('client_id').notNull().references(() => client.id, { onDelete: 'cascade' }),
	quote: text('quote'),
	authorName: varchar('author_name', { length: 255 }),
	authorTitle: varchar('author_title', { length: 255 }),
	status: testimonialStatusEnum('status').notNull().default('pending'),
	submissionToken: text('submission_token').notNull().unique(),
	tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const blogPost = pgTable('blog_post', {
	id: serial('id').primaryKey(),
	authorId: text('author_id').notNull().references(() => userTable.id, { onDelete: 'cascade' }),
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
	postId: integer('post_id').notNull().references(() => blogPost.id, { onDelete: 'cascade' }),
	categoryId: integer('category_id').notNull().references(() => blogCategory.id, { onDelete: 'cascade' })
});

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

// --- COMMERCE TABLES ---

export const product = pgTable('product', {
	id: serial('id').primaryKey(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	name: varchar('name', { length: 255 }).notNull(),
	shortDescription: text('short_description'),
	longDescription: jsonb('long_description'),
	type: productTypeEnum('type').notNull().default('physical'),
	tags: text('tags').array(),
	mediaId: integer('media_id').references(() => media.id, { onDelete: 'set null' }),
	approvalStatus: varchar('approval_status', { length: 50 }).notNull().default('pending'), // 'draft', 'pending', 'approved', 'rejected'
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const productVariant = pgTable('product_variant', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	productId: integer('product_id').notNull().references(() => product.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	sku: text('sku'),
	priceUsd: integer('price_usd'), // Base List Price (Cents)
	priceZar: integer('price_zar'), // Base List Price (Cents)
	shippingFlatRate: integer('shipping_flat_rate').default(0), // Shipping cost in base currency cents
	stock: integer('stock'),
	isDefault: boolean('is_default').notNull().default(false),
});

export const productFeature = pgTable('product_feature', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	productId: integer('product_id').notNull().references(() => product.id, { onDelete: 'cascade' }),
	icon: text('icon'),
	text: text('text').notNull(),
	displayOrder: integer('display_order').notNull().default(0),
});

export const productImage = pgTable('product_image', {
	id: serial('id').primaryKey(),
	productId: integer('product_id').notNull().references(() => product.id, { onDelete: 'cascade' }),
	mediaId: integer('media_id').notNull().references(() => media.id, { onDelete: 'cascade' }),
	displayOrder: integer('display_order').notNull().default(0)
});

// --- SUPPLIER & PRICING ---

export const supplier = pgTable('supplier', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	contactEmail: varchar('contact_email', { length: 255 }),
	defaultMarkup: integer('default_markup').default(0), // Percentage x 100 (e.g. 5000 = 50.00%)? Or simple integer percentage? Let's assume integer percentage for now: 20 = 20%
	currency: varchar('currency', { length: 3 }).notNull().default('USD'),
	createdAt: timestamp('created_at').defaultNow()
});

export const productSupplier = pgTable('product_supplier', {
	id: serial('id').primaryKey(),
	variantId: text('variant_id').notNull().references(() => productVariant.id, { onDelete: 'cascade' }),
	supplierId: integer('supplier_id').notNull().references(() => supplier.id, { onDelete: 'cascade' }),
	supplierSku: varchar('supplier_sku', { length: 100 }),
	rawPrice: integer('raw_price').notNull(), // Cost price in supplier currency (cents)
	isOnFile: boolean('is_on_file').default(false), // If we have this price on file/confirmed
	updatedAt: timestamp('updated_at').defaultNow()
});

export const currencyRate = pgTable('currency_rate', {
	id: serial('id').primaryKey(),
	fromCurrency: varchar('from_currency', { length: 3 }).notNull(),
	toCurrency: varchar('to_currency', { length: 3 }).notNull(),
	rate: integer('rate').notNull(), // Exchange rate * 1000000 (preserves 6 decimal places)
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// --- NEW: MARKETING & SALES EVENTS ---

export const saleEvent = pgTable('sale_event', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	name: text('name').notNull(), // Internal Admin Name
	publicLabel: text('public_label'), // Shown on badges (e.g. "Summer Sale")
	bannerText: text('banner_text'), // Optional site-wide banner
	startsAt: timestamp('starts_at', { withTimezone: true, mode: 'date' }).notNull(),
	endsAt: timestamp('ends_at', { withTimezone: true, mode: 'date' }).notNull(),
	isActive: boolean('is_active').notNull().default(true), // Master kill switch
	createdAt: timestamp('created_at').defaultNow()
});

export const salePrice = pgTable('sale_price', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	eventId: text('event_id').notNull().references(() => saleEvent.id, { onDelete: 'cascade' }),
	variantId: text('variant_id').notNull().references(() => productVariant.id, { onDelete: 'cascade' }),
	salePriceUsd: integer('sale_price_usd'), // Override Price (Cents)
	salePriceZar: integer('sale_price_zar'), // Override Price (Cents)
}, (t) => ({
	// Constraint: A variant can only have one price entry per event
	uniqueVariantEvent: { columns: [t.eventId, t.variantId] }
}));

export const discountCode = pgTable('discount_code', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	code: varchar('code', { length: 50 }).notNull().unique(), // Uppercase, e.g., "SAVE20"
	type: discountTypeEnum('type').notNull(), // 'percentage' or 'fixed'
	value: integer('value').notNull(), // 20 for 20%, or 1000 for $10.00
	startsAt: timestamp('starts_at', { withTimezone: true, mode: 'date' }),
	endsAt: timestamp('ends_at', { withTimezone: true, mode: 'date' }),
	usageLimit: integer('usage_limit'), // Total times it can be used globally
	usageCount: integer('usage_count').notNull().default(0),
	minOrderAmount: integer('min_order_amount'), // In base currency cents (usually USD for checks)
	isActive: boolean('is_active').notNull().default(true)
});

// SMART LINK: Solutions <-> Products
export const solutionsToProducts = pgTable('solutions_to_products', {
	solutionId: integer('solution_id').notNull().references(() => solution.id, { onDelete: 'cascade' }),
	productId: integer('product_id').notNull().references(() => product.id, { onDelete: 'cascade' }),
}, (t) => ({
	pk: primaryKey({ columns: [t.solutionId, t.productId] }),
}));

export const order = pgTable('order', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	publicId: serial('public_id').notNull().unique(),
	userId: text('user_id').notNull().references(() => userTable.id),
	shippingAddressId: text('shipping_address_id').references(() => userAddress.id),
	status: orderStatusEnum('status').notNull().default('pending'),
	total: integer('total').notNull(),
	subtotal: integer('subtotal'), // Added to track pre-discount amount
	discountCodeId: text('discount_code_id').references(() => discountCode.id),
	discountAmount: integer('discount_amount').default(0), // Amount saved in cents
	currency: text('currency').notNull().default('USD'),
	paymentGatewayPollUrl: text('payment_gateway_poll_url'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const orderItem = pgTable('order_item', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	orderId: text('order_id').notNull().references(() => order.id, { onDelete: 'cascade' }),
	productVariantId: text('product_variant_id').references(() => productVariant.id, { onDelete: 'set null' }),
	quantity: integer('quantity').notNull(),
	priceAtPurchase: integer('price_at_purchase').notNull(),
});

// --- SYSTEM & UTILITY TABLES ---

export const auditLog = pgTable('audit_log', {
	id: serial('id').primaryKey(),
	userId: text('user_id').references(() => userTable.id, { onDelete: 'set null' }),
	action: varchar('action', { length: 255 }).notNull(),
	targetId: varchar('target_id', { length: 255 }),
	data: jsonb('data'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const siteSettings = pgTable('site_setting', {
	key: varchar('key', { length: 255 }).primaryKey(),
	value: text('value')
});

export const location = pgTable('location', {
	id: serial('id').primaryKey(),
	countryName: varchar('country_name', { length: 255 }).notNull(),
	countryCode: varchar('country_code', { length: 2 }).notNull(),
	address: text('address').notNull(),
	phoneNumber: varchar('phone_number', { length: 255 }),
	latitude: varchar('latitude', { length: 255 }),
	longitude: varchar('longitude', { length: 255 })
});

export const pageContent = pgTable('page_content', {
	id: serial('id').primaryKey(),
	page: varchar('page', { length: 255 }).notNull(),
	section: varchar('section', { length: 255 }).notNull().unique(),
	title: varchar('title', { length: 255 }),
	text: text('text'),
	mediaId: integer('media_id').references(() => media.id, { onDelete: 'set null' })
});

export const userInvite = pgTable('user_invite', {
	id: serial('id').primaryKey(),
	token: text('token').notNull().unique(),
	email: varchar('email', { length: 255 }).notNull(),
	role: userRoleEnum('role').notNull().default('content_editor'),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
	usedAt: timestamp('used_at', { withTimezone: true, mode: 'date' }),
	createdBy: text('created_by').references(() => userTable.id, { onDelete: 'set null' })
});

export const teamMember = pgTable('team_member', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	title: varchar('title', { length: 255 }).notNull(),
	bio: text('bio'),
	mediaId: integer('media_id').references(() => media.id, { onDelete: 'set null' })
});

export const document = pgTable('document', {
	id: serial('id').primaryKey(),
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	fileUrl: text('file_url').notNull(),
	isGated: boolean('is_gated').default(false).notNull(),
	thumbnailMediaId: integer('thumbnail_media_id').references(() => media.id, { onDelete: 'set null' }),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const gatedDocumentLead = pgTable('gated_document_lead', {
	id: serial('id').primaryKey(),
	documentId: integer('document_id').notNull().references(() => document.id, { onDelete: 'cascade' }),
	email: varchar('email', { length: 255 }).notNull(),
	submittedAt: timestamp('submitted_at').defaultNow().notNull()
});

export const trackedLink = pgTable('tracked_link', {
	id: serial('id').primaryKey(),
	shortCode: varchar('short_code', { length: 255 }).notNull().unique(),
	destinationUrl: text('destination_url').notNull(),
	description: varchar('description', { length: 255 }),
	userId: text('user_id').notNull().references(() => userTable.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const linkVisit = pgTable('link_visit', {
	id: serial('id').primaryKey(),
	linkId: integer('link_id').notNull().references(() => trackedLink.id, { onDelete: 'cascade' }),
	ipCountry: varchar('ip_country', { length: 2 }),
	browser: varchar('browser', { length: 100 }),
	os: varchar('os', { length: 100 }),
	deviceType: varchar('device_type', { length: 50 }),
	referrer: text('referrer'),
	visitedAt: timestamp('visited_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

// --- RELATIONS ---

export const userRelations = relations(userTable, ({ many }) => ({
	blogPosts: many(blogPost),
	auditLogs: many(auditLog),
	trackedLinks: many(trackedLink),
	sessions: many(sessionTable),
	orders: many(order),
	addresses: many(userAddress)
}));

export const productRelations = relations(product, ({ one, many }) => ({
	featuredImage: one(media, { fields: [product.mediaId], references: [media.id] }),
	images: many(productImage),
	variants: many(productVariant),
	features: many(productFeature),
	solutions: many(solutionsToProducts)
}));

export const productVariantRelations = relations(productVariant, ({ one, many }) => ({
	product: one(product, { fields: [productVariant.productId], references: [product.id] }),
	orderItems: many(orderItem),
	salePrices: many(salePrice),
	supplierLinks: many(productSupplier)
}));

export const productSupplierRelations = relations(productSupplier, ({ one }) => ({
	variant: one(productVariant, { fields: [productSupplier.variantId], references: [productVariant.id] }),
	supplier: one(supplier, { fields: [productSupplier.supplierId], references: [supplier.id] })
}));

export const productFeatureRelations = relations(productFeature, ({ one }) => ({
	product: one(product, { fields: [productFeature.productId], references: [product.id] })
}));

export const productImageRelations = relations(productImage, ({ one }) => ({
	product: one(product, { fields: [productImage.productId], references: [product.id] }),
	media: one(media, { fields: [productImage.mediaId], references: [media.id] })
}));

export const solutionRelations = relations(solution, ({ one, many }) => ({
	featuredImage: one(media, { fields: [solution.mediaId], references: [media.id] }),
	products: many(solutionsToProducts)
}));

export const solutionsToProductsRelations = relations(solutionsToProducts, ({ one }) => ({
	solution: one(solution, { fields: [solutionsToProducts.solutionId], references: [solution.id] }),
	product: one(product, { fields: [solutionsToProducts.productId], references: [product.id] }),
}));

export const orderRelations = relations(order, ({ one, many }) => ({
	user: one(userTable, { fields: [order.userId], references: [userTable.id] }),
	items: many(orderItem),
	shippingAddress: one(userAddress, { fields: [order.shippingAddressId], references: [userAddress.id] }),
	discountCode: one(discountCode, { fields: [order.discountCodeId], references: [discountCode.id] })
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
	order: one(order, { fields: [orderItem.orderId], references: [order.id] }),
	variant: one(productVariant, { fields: [orderItem.productVariantId], references: [productVariant.id] })
}));

export const saleEventRelations = relations(saleEvent, ({ many }) => ({
	prices: many(salePrice)
}));

export const salePriceRelations = relations(salePrice, ({ one }) => ({
	event: one(saleEvent, { fields: [salePrice.eventId], references: [saleEvent.id] }),
	variant: one(productVariant, { fields: [salePrice.variantId], references: [productVariant.id] })
}));

export const discountCodeRelations = relations(discountCode, ({ many }) => ({
	orders: many(order)
}));

export const userAddressRelations = relations(userAddress, ({ one }) => ({
	user: one(userTable, { fields: [userAddress.userId], references: [userTable.id] })
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
	user: one(userTable, { fields: [auditLog.userId], references: [userTable.id] })
}));

export const pageContentRelations = relations(pageContent, ({ one }) => ({
	media: one(media, { fields: [pageContent.mediaId], references: [media.id] })
}));

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
	photo: one(media, { fields: [teamMember.mediaId], references: [media.id] })
}));

export const documentRelations = relations(document, ({ one }) => ({
	thumbnail: one(media, { fields: [document.thumbnailMediaId], references: [media.id] })
}));

export const gatedDocumentLeadRelations = relations(gatedDocumentLead, ({ one }) => ({
	document: one(document, { fields: [gatedDocumentLead.documentId], references: [document.id] })
}));

export const blogPostRelations = relations(blogPost, ({ one, many }) => ({
	author: one(userTable, { fields: [blogPost.authorId], references: [userTable.id] }),
	featuredImage: one(media, { fields: [blogPost.mediaId], references: [media.id] }),
	categories: many(blogPostsToCategories)
}));

export const blogCategoryRelations = relations(blogCategory, ({ many }) => ({
	posts: many(blogPostsToCategories)
}));

export const blogPostsToCategoriesRelations = relations(blogPostsToCategories, ({ one }) => ({
	post: one(blogPost, { fields: [blogPostsToCategories.postId], references: [blogPost.id] }),
	category: one(blogCategory, { fields: [blogPostsToCategories.categoryId], references: [blogCategory.id] })
}));

export const clientRelations = relations(client, ({ many, one }) => ({
	caseStudies: many(caseStudy),
	testimonials: many(testimonial),
	logo: one(media, { fields: [client.mediaId], references: [media.id] })
}));

export const leadRelations = relations(lead, ({ one }) => ({
	solution: one(solution, { fields: [lead.solutionId], references: [solution.id] })
}));

export const testimonialRelations = relations(testimonial, ({ one }) => ({
	client: one(client, { fields: [testimonial.clientId], references: [client.id] })
}));

export const caseStudyRelations = relations(caseStudy, ({ one, many }) => ({
	results: many(caseStudyResult),
	client: one(client, { fields: [caseStudy.clientId], references: [client.id] })
}));

export const caseStudyResultRelations = relations(caseStudyResult, ({ one }) => ({
	caseStudy: one(caseStudy, { fields: [caseStudyResult.caseStudyId], references: [caseStudy.id] })
}));

export const trackedLinkRelations = relations(trackedLink, ({ one, many }) => ({
	user: one(userTable, { fields: [trackedLink.userId], references: [userTable.id] }),
	visits: many(linkVisit)
}));

export const linkVisitRelations = relations(linkVisit, ({ one }) => ({
	link: one(trackedLink, { fields: [linkVisit.linkId], references: [trackedLink.id] })
}));

export const userInviteRelations = relations(userInvite, ({ one }) => ({
	creator: one(userTable, { fields: [userInvite.createdBy], references: [userTable.id] })
}));
