// To run: `node src/lib/server/db/seed.js`
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import { Argon2id } from 'oslo/password';
import { generateId } from 'lucia';
import { createId } from '@paralleldrive/cuid2';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('DATABASE_URL is not set');
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

// --- Helpers ---
const slugify = (text) => text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function main() {
	console.log('🌱 Starting Comprehensive Database Seed...');

	// 1. CLEANUP (Order is critical to prevent FK errors)
    console.log('🧹 Clearing existing data...');
    await db.delete(schema.linkVisit);
    await db.delete(schema.trackedLink);
    await db.delete(schema.auditLog);
    await db.delete(schema.gatedDocumentLead);
    await db.delete(schema.document);
    await db.delete(schema.orderItem);
    await db.delete(schema.order);
    await db.delete(schema.userAddress);
    await db.delete(schema.solutionsToProducts);
    await db.delete(schema.productImage);
    await db.delete(schema.productFeature);
    await db.delete(schema.productVariant);
    await db.delete(schema.product);
    await db.delete(schema.caseStudyResult);
    await db.delete(schema.caseStudy);
    await db.delete(schema.lead);
    await db.delete(schema.solution);
    await db.delete(schema.testimonial);
    await db.delete(schema.client);
    await db.delete(schema.blogPostsToCategories);
    await db.delete(schema.blogPost);
    await db.delete(schema.blogCategory);
    await db.delete(schema.pageContent);
    await db.delete(schema.siteSettings);
    await db.delete(schema.teamMember);
    await db.delete(schema.media);
    await db.delete(schema.sessionTable);
    await db.delete(schema.userTable);

    // 2. MEDIA LIBRARY (Placeholders)
    console.log('🖼️  Seeding Media...');
    const mediaList = [];
    const images = [
        { url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80', alt: 'Industrial Robot Arm' },
        { url: 'https://images.unsplash.com/photo-1535376435290-90e5b636e099?auto=format&fit=crop&w=1200&q=80', alt: 'Server Room' },
        { url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80', alt: 'Construction Site' },
        { url: 'https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&w=1200&q=80', alt: 'Drone Surveillance' },
        { url: 'https://images.unsplash.com/photo-1580894908361-967195033215?auto=format&fit=crop&w=1200&q=80', alt: 'Microchip' },
        { url: 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?auto=format&fit=crop&w=1200&q=80', alt: 'Mining Excavator' }
    ];

    for (const img of images) {
        const [m] = await db.insert(schema.media).values({
            altText: img.alt,
            originalUrl: img.url,
            displayUrl: img.url,
            thumbnailUrl: img.url,
            width: 1200,
            height: 800
        }).returning();
        mediaList.push(m);
    }

    // 3. USERS & ROLES
    console.log('👤 Creating Staff & Customers...');
    const passwordHash = await new Argon2id().hash('password');
    
    const users = [
        { email: 'admin@vision-ai.tech', username: 'System Admin', role: 'admin', first: 'Admin', last: 'User' },
        { email: 'store@vision-ai.tech', username: 'Inventory Mgr', role: 'store_manager', first: 'Store', last: 'Manager' },
        { email: 'editor@vision-ai.tech', username: 'Content Lead', role: 'content_editor', first: 'Content', last: 'Editor' },
        { email: 'customer@example.com', username: 'Jane Doe', role: 'customer', first: 'Jane', last: 'Doe' }
    ];

    const userMap = {};

    for (const u of users) {
        const uid = generateId(15);
        await db.insert(schema.userTable).values({
            id: uid,
            email: u.email,
            username: u.username,
            firstName: u.first,
            lastName: u.last,
            role: u.role,
            passwordHash: passwordHash,
            status: 'active'
        });
        userMap[u.role] = uid;
    }

    // Address for Customer
    await db.insert(schema.userAddress).values({
        userId: userMap['customer'],
        label: 'HQ',
        firstName: 'Jane',
        lastName: 'Doe',
        address: '123 Industrial Parkway',
        city: 'Harare',
        state: 'Harare',
        zipCode: '0000',
        country: 'Zimbabwe',
        isDefault: true
    });

    // 4. SETTINGS
    console.log('⚙️  Applying Settings...');
    await db.insert(schema.siteSettings).values([
        { key: 'site_name', value: 'Vision AI Tech' },
        { key: 'exchange_rate_usd_to_zar', value: '18.50' },
        { key: 'hero_video_url', value: '' },
        { key: 'whatsapp_number', value: '263771234567' }
    ]);

    // 5. CONTENT: SOLUTIONS
    console.log('💡 Creating Solutions...');
    const solutionsData = [
        { name: 'Fleet Optimization', desc: 'AI-driven telematics to reduce fuel consumption and predict maintenance.', media: mediaList[5] },
        { name: 'Site Safety AI', desc: 'Computer vision that detects PPE compliance and hazardous zones in real-time.', media: mediaList[2] },
        { name: 'Autonomous Drilling', desc: 'Precision automation for mineral extraction efficiency.', media: mediaList[0] }
    ];

    const createdSolutions = [];
    for (const sol of solutionsData) {
        const [s] = await db.insert(schema.solution).values({
            solutionName: sol.name,
            slug: slugify(sol.name),
            shortDescription: sol.desc,
            longDescription: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: sol.desc + ' Detailed technical breakdown...' }] }] },
            mediaId: sol.media.id,
            ctaText: 'Book Consultation',
            ctaLink: '/contact'
        }).returning();
        createdSolutions.push(s);
    }

    // 6. COMMERCE: PRODUCTS
    console.log('📦 Creating Products...');
    
    // Product 1: Physical Hardware (Linked to Fleet Solution)
    const [p1] = await db.insert(schema.product).values({
        name: 'VisionTrack GPS Unit',
        slug: 'vision-track-gps',
        type: 'physical',
        shortDescription: 'Ruggedized GPS tracker for heavy haul trucks. IP68 rated.',
        longDescription: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'High precision GPS...' }] }] },
        mediaId: mediaList[4].id
    }).returning();

    await db.insert(schema.productVariant).values([
        { productId: p1.id, name: 'Standard 4G', sku: 'VT-4G-01', priceUsd: 15000, priceZar: 277500, stock: 100, isDefault: true },
        { productId: p1.id, name: 'Satellite Hybrid', sku: 'VT-SAT-01', priceUsd: 45000, priceZar: 832500, stock: 20, isDefault: false }
    ]);
    
    await db.insert(schema.productFeature).values([
        { productId: p1.id, icon: 'mdi:wifi', text: '4G/LTE & Satellite', displayOrder: 0 },
        { productId: p1.id, icon: 'mdi:water', text: 'IP68 Waterproof', displayOrder: 1 }
    ]);

    // Product 2: Digital License (Linked to Safety Solution)
    const [p2] = await db.insert(schema.product).values({
        name: 'SiteGuard Software License',
        slug: 'site-guard-license',
        type: 'digital',
        shortDescription: 'Annual license for the SiteGuard computer vision suite.',
        longDescription: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Unlocks all safety features...' }] }] },
        mediaId: mediaList[1].id
    }).returning();

    await db.insert(schema.productVariant).values([
        { productId: p2.id, name: 'Per Camera / Year', sku: 'LIC-CAM-1Y', priceUsd: 29900, priceZar: 553150, stock: null, isDefault: true }, // Unlimited stock
        { productId: p2.id, name: 'Enterprise (Unlimited)', sku: 'LIC-ENT-1Y', priceUsd: 500000, priceZar: 9250000, stock: null, isDefault: false }
    ]);

    // Product 3: Service
    const [p3] = await db.insert(schema.product).values({
        name: 'On-Site Calibration',
        slug: 'calibration-service',
        type: 'service',
        shortDescription: 'Expert engineering team deployment for sensor calibration.',
        longDescription: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'We come to you...' }] }] },
        mediaId: mediaList[3].id
    }).returning();

    await db.insert(schema.productVariant).values([
        { productId: p3.id, name: 'Daily Rate', sku: 'SVC-DAY', priceUsd: 120000, priceZar: 2220000, stock: null, isDefault: true }
    ]);

    // 7. SMART LINKING
    console.log('🔗 Linking Products to Solutions...');
    await db.insert(schema.solutionsToProducts).values([
        { solutionId: createdSolutions[0].id, productId: p1.id }, // Fleet -> GPS
        { solutionId: createdSolutions[1].id, productId: p2.id }, // Safety -> Software
        { solutionId: createdSolutions[2].id, productId: p3.id }  // Drilling -> Service
    ]);

    // 8. BLOGS & CATEGORIES
    console.log('📝 Creating Blog Posts...');
    const [cat1] = await db.insert(schema.blogCategory).values({ name: 'Technology', slug: 'technology' }).returning();
    const [cat2] = await db.insert(schema.blogCategory).values({ name: 'Case Studies', slug: 'case-studies' }).returning();

    const [post1] = await db.insert(schema.blogPost).values({
        authorId: userMap['content_editor'],
        title: 'The Future of Mining is Autonomous',
        slug: 'future-of-mining',
        mediaId: mediaList[5].id,
        isPublished: true,
        publishedAt: new Date(),
        contentJson: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Automation is changing the landscape...' }] }] }
    }).returning();

    await db.insert(schema.blogPostsToCategories).values({ postId: post1.id, categoryId: cat1.id });

    // 9. ORDERS (History)
    console.log('🛒 creating Order History...');
    
    // Order 1: Paid
    const orderId1 = createId();
    await db.insert(schema.order).values({
        id: orderId1,
        userId: userMap['customer'],
        total: 15000,
        currency: 'USD',
        status: 'paid',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
    });
    await db.insert(schema.orderItem).values({
        orderId: orderId1,
        productVariantId: (await db.query.productVariant.findFirst({ where: (v, { eq }) => eq(v.sku, 'VT-4G-01') })).id,
        quantity: 1,
        priceAtPurchase: 15000
    });

    // Order 2: Pending
    const orderId2 = createId();
    await db.insert(schema.order).values({
        id: orderId2,
        userId: userMap['customer'],
        total: 29900,
        currency: 'USD',
        status: 'pending',
        createdAt: new Date()
    });
    await db.insert(schema.orderItem).values({
        orderId: orderId2,
        productVariantId: (await db.query.productVariant.findFirst({ where: (v, { eq }) => eq(v.sku, 'LIC-CAM-1Y') })).id,
        quantity: 1,
        priceAtPurchase: 29900
    });

    // 10. HOMEPAGE CONTENT
    console.log('🏠 Seeding Homepage...');
    await db.insert(schema.pageContent).values([
        { page: 'homepage', section: 'hero', title: 'Industrial Intelligence.', text: 'AI solutions for the worlds toughest environments.', mediaId: mediaList[3].id },
        { page: 'homepage', section: 'technology', title: 'Data Driven Decisions', text: 'From sensors to satellites, we aggregate data.', mediaId: mediaList[4].id },
        { page: 'homepage', section: 'solutions_overview', title: 'Integrated Modules', text: 'A suite of tools working in harmony.', mediaId: null }
    ]);

	console.log('✅ Database Seeded Successfully!');
    console.log('------------------------------------------------');
    console.log('🔑 Credentials (Password for all: "password"):');
    console.log('   Admin: admin@vision-ai.tech');
    console.log('   Store Mgr: store@vision-ai.tech');
    console.log('   Editor: editor@vision-ai.tech');
    console.log('   Customer: customer@example.com');
    console.log('------------------------------------------------');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await client.end();
	});