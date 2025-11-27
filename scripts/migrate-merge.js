// scripts/migrate-merge.js
import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { createId } from '@paralleldrive/cuid2';
import * as schema from '../src/lib/server/db/schema.js';
import { eq, sql } from 'drizzle-orm';

// 1. Connections
const liveDb = postgres(process.env.LIVE_DATABASE_URL);
const storeDb = postgres(process.env.STORE_DATABASE_URL);
const targetClient = postgres(process.env.DATABASE_URL);
const targetDb = drizzle(targetClient, { schema });

// Maps to link old IDs to new IDs
const userMap = new Map();      // "source_id" -> NewUUID
const mediaMap = new Map();     // "source_id" -> NewIntID
const clientMap = new Map();    // OldIntID -> NewIntID
const solutionMap = new Map();  // OldIntID -> NewIntID
const productMap = new Map();   // OldStoreID (String) -> NewIntID
const variantMap = new Map();   // OldVariantID (String) -> NewUUID

async function main() {
    console.log('🚀 Starting Comprehensive Merge...');

    try {
        // ==============================================================================
        // 1. USERS (Merge & Deduplicate)
        // ==============================================================================
        console.log('👤 Migrating Users...');
        const liveUsers = await liveDb`SELECT * FROM "user"`;
        const storeUsers = await storeDb`SELECT * FROM "user"`;
        const usersByEmail = {};

        // Process Live Users (CMS)
        for (const u of liveUsers) {
            let email = u.username.includes('@') ? u.username : null;
            if (!email) {
                const cleanName = u.username.trim().toLowerCase().replace(/\s+/g, '.');
                email = `${cleanName}@vision-ai.tech`;
                console.log(`   ⚠️ Fixed username '${u.username}' -> '${email}'`);
            }

            usersByEmail[email] = {
                id: createId(),
                email: email,
                username: u.username.trim(),
                passwordHash: u.password_hash,
                firstName: '',
                lastName: '',
                role: 'admin', // CMS users are admins
                createdAt: new Date(),
                sourceIds: [`live_${u.id}`]
            };
        }

        // Merge Store Users
        for (const u of storeUsers) {
            if (usersByEmail[u.email]) {
                const existing = usersByEmail[u.email];
                existing.firstName = u.first_name || existing.firstName;
                existing.lastName = u.last_name || existing.lastName;
                if (u.role !== 'customer') existing.role = u.role;
                existing.sourceIds.push(`store_${u.id}`);
                if (u.created_at) existing.createdAt = u.created_at;
            } else {
                usersByEmail[u.email] = {
                    id: createId(),
                    email: u.email,
                    username: u.first_name ? `${u.first_name}${u.last_name || ''}`.toLowerCase() : u.email.split('@')[0],
                    passwordHash: u.hashed_password,
                    firstName: u.first_name,
                    lastName: u.last_name,
                    role: u.role || 'customer',
                    createdAt: u.created_at || new Date(),
                    sourceIds: [`store_${u.id}`]
                };
            }
        }

        for (const u of Object.values(usersByEmail)) {
            await targetDb.insert(schema.userTable).values({
                id: u.id,
                email: u.email,
                username: u.username,
                passwordHash: u.passwordHash || 'placeholder',
                firstName: u.firstName,
                lastName: u.lastName,
                role: u.role,
                createdAt: new Date(u.createdAt)
            }).onConflictDoNothing();

            u.sourceIds.forEach(sourceId => userMap.set(sourceId, u.id));
        }
        console.log(`   ✅ Merged ${Object.keys(usersByEmail).length} users.`);


        // ==============================================================================
        // 2. MEDIA (Consolidate)
        // ==============================================================================
        console.log('🖼️ Migrating Media...');
        async function migrateMedia(list, prefix) {
            for (const m of list) {
                const [inserted] = await targetDb.insert(schema.media).values({
                    altText: m.alt_text || m.altText || 'Media',
                    originalUrl: m.original_url || m.originalUrl,
                    width: m.width || 0,
                    height: m.height || 0,
                    thumbnailUrl: m.thumbnail_url || m.thumbnailUrl,
                    displayUrl: m.display_url || m.displayUrl,
                    blurDataUrl: m.blur_data_url || m.blurDataUrl,
                    uploadedAt: m.uploaded_at ? new Date(m.uploaded_at) : new Date()
                }).returning();
                mediaMap.set(`${prefix}_${m.id}`, inserted.id);
            }
        }
        const liveMedia = await liveDb`SELECT * FROM media`;
        // Store implies product_image is media, but strict media table might exist too if using similar schema
        // Based on inspection, Store only had product_image, not a generic media table? 
        // Checking inspection... Ah, Store DOES NOT have a 'media' table. It has 'product_image'.
        // We will migrate Store images attached to products later.
        await migrateMedia(liveMedia, 'live');
        console.log(`   ✅ Migrated ${liveMedia.length} CMS media items.`);


        // ==============================================================================
        // 3. SYSTEM SETTINGS & LOCATIONS
        // ==============================================================================
        console.log('⚙️ Migrating Settings & Locations...');
        
        const settings = await liveDb`SELECT * FROM site_setting`;
        for (const s of settings) {
            await targetDb.insert(schema.siteSettings).values({
                key: s.key,
                value: s.value
            }).onConflictDoNothing();
        }

        const locations = await liveDb`SELECT * FROM location`;
        for (const loc of locations) {
            await targetDb.insert(schema.location).values({
                countryName: loc.country_name,
                countryCode: loc.country_code,
                address: loc.address,
                phoneNumber: loc.phone_number,
                latitude: loc.latitude,
                longitude: loc.longitude
            });
        }
        console.log(`   ✅ Migrated ${settings.length} settings and ${locations.length} locations.`);


        // ==============================================================================
        // 4. CLIENTS & TESTIMONIALS
        // ==============================================================================
        console.log('🤝 Migrating Partners & Testimonials...');
        
        const clients = await liveDb`SELECT * FROM client`;
        for (const c of clients) {
            const [newClient] = await targetDb.insert(schema.client).values({
                name: c.name,
                mediaId: c.media_id ? mediaMap.get(`live_${c.media_id}`) : null
            }).returning();
            
            clientMap.set(c.id, newClient.id);
        }

        const testimonials = await liveDb`SELECT * FROM testimonial`;
        for (const t of testimonials) {
            const newClientId = clientMap.get(t.client_id);
            if (newClientId) {
                await targetDb.insert(schema.testimonial).values({
                    clientId: newClientId,
                    quote: t.quote,
                    authorName: t.author_name,
                    authorTitle: t.author_title,
                    status: t.status,
                    submissionToken: t.submission_token,
                    tokenExpiresAt: t.token_expires_at
                }).onConflictDoNothing();
            }
        }
        console.log(`   ✅ Migrated ${clients.length} clients and ${testimonials.length} testimonials.`);


        // ==============================================================================
        // 5. SOLUTIONS & TEAM
        // ==============================================================================
        console.log('💡 Migrating Solutions & Team...');

        const solutions = await liveDb`SELECT * FROM solution`;
        for (const s of solutions) {
            const [newSol] = await targetDb.insert(schema.solution).values({
                slug: s.slug,
                solutionName: s.solution_name,
                mediaId: s.media_id ? mediaMap.get(`live_${s.media_id}`) : null,
                shortDescription: s.short_description,
                longDescription: s.long_description,
                ctaText: s.cta_text,
                ctaLink: s.cta_link
            }).onConflictDoNothing().returning();
            
            if (newSol) solutionMap.set(s.id, newSol.id);
        }

        const members = await liveDb`SELECT * FROM team_member`;
        for (const m of members) {
            await targetDb.insert(schema.teamMember).values({
                name: m.name,
                title: m.title,
                bio: m.bio,
                mediaId: m.media_id ? mediaMap.get(`live_${m.media_id}`) : null
            });
        }
        console.log(`   ✅ Migrated ${solutions.length} solutions and ${members.length} team members.`);


        // ==============================================================================
        // 6. STORE PRODUCTS
        // ==============================================================================
        console.log('📦 Migrating Store Products...');
        const storeProducts = await storeDb`SELECT * FROM product`;

        for (const p of storeProducts) {
            let type = 'physical';
            if (p.type === 'digital') type = 'digital';
            if (p.type === 'service') type = 'service';

            // Create unique slug if missing or duplicate
            let slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            if (!slug) slug = `product-${p.id}`;

            const [newProd] = await targetDb.insert(schema.product).values({
                name: p.name,
                slug: slug,
                shortDescription: p.description ? p.description.substring(0, 255) : '',
                type: type,
                createdAt: p.created_at,
                updatedAt: p.updated_at
            }).onConflictDoNothing().returning();

            if (!newProd) continue; // Skip if exists

            productMap.set(p.id, newProd.id);

            // Migrate Images from 'product_image' table in Store DB
            const pImages = await storeDb`SELECT * FROM product_image WHERE product_id = ${p.id} ORDER BY display_order`;
            for (const img of pImages) {
                // Create Media entry
                const [newMedia] = await targetDb.insert(schema.media).values({
                    altText: img.alt_text || p.name,
                    originalUrl: img.url,
                    width: 800, height: 600, // Defaults
                    thumbnailUrl: img.url
                }).returning();

                // Link to Product
                await targetDb.insert(schema.productImage).values({
                    productId: newProd.id,
                    mediaId: newMedia.id,
                    displayOrder: img.display_order || 0
                });

                // Set Featured
                if (img.is_featured) {
                    await targetDb.update(schema.product).set({ mediaId: newMedia.id }).where(eq(schema.product.id, newProd.id));
                }
            }

            // Migrate Variants
            const variants = await storeDb`SELECT * FROM product_variant WHERE product_id = ${p.id}`;
            for (const v of variants) {
                const newVarId = createId();
                await targetDb.insert(schema.productVariant).values({
                    id: newVarId,
                    productId: newProd.id,
                    name: v.name,
                    sku: v.sku,
                    priceUsd: v.price_usd ? Math.round(parseFloat(v.price_usd) * 100) : null,
                    priceZar: v.price_zar ? Math.round(parseFloat(v.price_zar) * 100) : null,
                    stock: v.stock || 0,
                    isDefault: v.is_default
                });
                variantMap.set(v.id, newVarId);
            }
        }
        console.log(`   ✅ Migrated ${storeProducts.length} products.`);


        // ==============================================================================
        // 7. CMS PAGES, DOCS & BLOG
        // ==============================================================================
        console.log('📝 Migrating Page Content & Blog...');

        const pageContents = await liveDb`SELECT * FROM page_content`;
        for (const pc of pageContents) {
            await targetDb.insert(schema.pageContent).values({
                page: pc.page,
                section: pc.section,
                title: pc.title,
                text: pc.text,
                mediaId: pc.media_id ? mediaMap.get(`live_${pc.media_id}`) : null
            }).onConflictDoNothing();
        }

        const docs = await liveDb`SELECT * FROM document`;
        for (const d of docs) {
            await targetDb.insert(schema.document).values({
                title: d.title,
                description: d.description,
                fileUrl: d.file_url,
                isGated: d.is_gated,
                thumbnailMediaId: d.thumbnail_media_id ? mediaMap.get(`live_${d.thumbnail_media_id}`) : null,
                createdAt: d.created_at
            });
        }

        const posts = await liveDb`SELECT * FROM blog_post`;
        for (const p of posts) {
            const newAuthorId = userMap.get(`live_${p.author_id}`);
            if (newAuthorId) {
                await targetDb.insert(schema.blogPost).values({
                    title: p.title,
                    slug: p.slug,
                    contentJson: p.content_json,
                    authorId: newAuthorId,
                    isPublished: p.is_published,
                    publishedAt: p.published_at,
                    mediaId: p.media_id ? mediaMap.get(`live_${p.media_id}`) : null
                }).onConflictDoNothing();
            }
        }
        console.log(`   ✅ Migrated content sections, docs, and blog.`);


        // ==============================================================================
        // 8. CASE STUDIES & LEADS
        // ==============================================================================
        console.log('📊 Migrating Case Studies & Leads...');

        const studies = await liveDb`SELECT * FROM case_study`;
        for (const cs of studies) {
            const newClientId = cs.client_id ? clientMap.get(cs.client_id) : null;
            const [newCs] = await targetDb.insert(schema.caseStudy).values({
                clientId: newClientId,
                slug: cs.slug,
                title: cs.title,
                challenge: cs.challenge,
                solution: cs.solution
            }).onConflictDoNothing().returning();

            if (newCs) {
                const results = await liveDb`SELECT * FROM case_study_result WHERE case_study_id = ${cs.id}`;
                for (const r of results) {
                    await targetDb.insert(schema.caseStudyResult).values({
                        caseStudyId: newCs.id,
                        kpiName: r.kpi_name,
                        kpiValue: r.kpi_value
                    });
                }
            }
        }

        const leads = await liveDb`SELECT * FROM lead`;
        for (const l of leads) {
            const newSolId = l.solution_id ? solutionMap.get(l.solution_id) : null;
            await targetDb.insert(schema.lead).values({
                firstName: l.first_name,
                lastName: l.last_name,
                email: l.email,
                message: l.message,
                solutionId: newSolId,
                status: l.status, // Assumes enum matches
                createdAt: l.created_at
            });
        }
        console.log(`   ✅ Migrated case studies and leads.`);


        // ==============================================================================
        // 9. ORDERS & LINKS
        // ==============================================================================
        console.log('🛒 Migrating Orders & Tracked Links...');

        const orders = await storeDb`SELECT * FROM "order"`;
        for (const o of orders) {
            const newUserId = userMap.get(`store_${o.user_id}`);
            if (!newUserId) continue;

            const newOrderId = createId();
            await targetDb.insert(schema.order).values({
                id: newOrderId,
                publicId: o.public_id,
                userId: newUserId,
                status: o.status === 'processing' ? 'paid' : o.status,
                total: Math.round(parseFloat(o.total) * 100),
                currency: o.currency,
                createdAt: o.created_at
            }).onConflictDoNothing();

            const items = await storeDb`SELECT * FROM order_item WHERE order_id = ${o.id}`;
            for (const item of items) {
                const newVariantId = variantMap.get(item.product_variant_id);
                if (newVariantId) {
                    await targetDb.insert(schema.orderItem).values({
                        orderId: newOrderId,
                        productVariantId: newVariantId,
                        quantity: item.quantity,
                        priceAtPurchase: Math.round(parseFloat(item.price_at_purchase) * 100)
                    });
                }
            }
        }

        // Tracked Links (CMS)
        const links = await liveDb`SELECT * FROM tracked_link`;
        for (const tl of links) {
            const newUserId = userMap.get(`live_${tl.user_id}`);
            if (newUserId) {
                const [newLink] = await targetDb.insert(schema.trackedLink).values({
                    shortCode: tl.short_code,
                    destinationUrl: tl.destination_url,
                    description: tl.description,
                    userId: newUserId,
                    createdAt: tl.created_at
                }).onConflictDoNothing().returning();

                if (newLink) {
                    const visits = await liveDb`SELECT * FROM link_visit WHERE link_id = ${tl.id}`;
                    for (const v of visits) {
                        await targetDb.insert(schema.linkVisit).values({
                            linkId: newLink.id,
                            ipCountry: v.ip_country,
                            browser: v.browser,
                            os: v.os,
                            deviceType: v.device_type,
                            referrer: v.referrer,
                            visitedAt: v.visited_at
                        });
                    }
                }
            }
        }
        console.log(`   ✅ Migrated orders and tracking links.`);

    } catch (err) {
        console.error('❌ Fatal Migration Error:', err);
    } finally {
        await liveDb.end();
        await storeDb.end();
        await targetClient.end();
        console.log('\n👋 Migration Complete.');
        process.exit(0);
    }
}

main();
