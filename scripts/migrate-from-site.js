import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../src/lib/server/db/schema.js';
import { generateId } from 'lucia';
import { createId } from '@paralleldrive/cuid2';
import fs from 'fs';

// 1. CONFIGURATION
const LIVE_DB_URL = process.env.LIVE_DATABASE_URL;
const LOCAL_DB_URL = process.env.DATABASE_URL;

if (!LIVE_DB_URL || !LOCAL_DB_URL) {
    console.error('❌ Error: Missing LIVE_DATABASE_URL or DATABASE_URL in .env');
    process.exit(1);
}

// 2. CONNECTIONS
const sourceSql = postgres(LIVE_DB_URL);
const destClient = postgres(LOCAL_DB_URL);
const db = drizzle(destClient, { schema });

// 3. OUTPUT FILE STREAM
const sqlStream = fs.createWriteStream('backup_migrated_data.sql', { flags: 'w' });

// Helper to write SQL to file
function logSql(tableName, data) {
    const keys = Object.keys(data);
    const values = Object.values(data).map(val => {
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'number') return val;
        if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
        if (val instanceof Date) return `'${val.toISOString()}'`;
        if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`; // JSONB
        return `'${String(val).replace(/'/g, "''")}'`; // Escape single quotes
    });

    const sql = `INSERT INTO "${tableName}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
    sqlStream.write(sql);
}

// 4. ID MAPPINGS
const idMaps = {
    users: new Map(),
    media: new Map(),
    solutions: new Map(),
    clients: new Map(),
    documents: new Map()
};

async function main() {
    console.log('🚀 Starting Migration (Skipping Audit Logs)...');
    sqlStream.write('-- MIGRATION DUMP \n-- Generated: ' + new Date().toISOString() + '\n\n');

    try {
        // --- 1. USERS ---
        console.log('👤 Migrating Users...');
        const oldUsers = await sourceSql`SELECT * FROM "user"`;
        
        for (const u of oldUsers) {
            const isEmail = u.username.includes('@');
            const email = isEmail ? u.username : `${u.username.replace(/\s+/g, '.').toLowerCase()}@vision-ai.tech`;
            const newId = generateId(15);
            
            idMaps.users.set(u.id, newId);

            const userData = {
                id: newId,
                username: u.username,
                email: email,
                passwordHash: u.password_hash,
                role: 'admin', 
                status: 'active',
                firstName: u.username.split(' ')[0] || 'Admin',
                lastName: u.username.split(' ')[1] || 'User',
                createdAt: new Date()
            };

            await db.insert(schema.userTable).values(userData).onConflictDoNothing();
            logSql('user', userData);
        }
        console.log(`✅ Processed ${oldUsers.length} Users.`);

        // --- 2. MEDIA ---
        console.log('🖼️  Migrating Media...');
        const oldMedia = await sourceSql`SELECT * FROM media`;
        for (const m of oldMedia) {
            const [newM] = await db.insert(schema.media).values({
                altText: m.alt_text || 'Migrated Image',
                originalUrl: m.original_url,
                displayUrl: m.display_url || m.original_url,
                thumbnailUrl: m.thumbnail_url || m.original_url,
                width: m.width || 1000,
                height: m.height || 1000,
                blurDataUrl: m.blur_data_url,
                uploadedAt: m.uploaded_at
            }).returning();
            
            idMaps.media.set(m.id, newM.id);
            logSql('media', { ...newM, id: newM.id });
        }
        console.log(`✅ Migrated ${oldMedia.length} Media items.`);

        // --- 3. SITE SETTINGS ---
        console.log('⚙️  Migrating Site Settings...');
        const oldSettings = await sourceSql`SELECT * FROM site_setting`;
        for (const s of oldSettings) {
            const settingData = { key: s.key, value: s.value };
            await db.insert(schema.siteSettings)
                .values(settingData)
                .onConflictDoUpdate({ target: schema.siteSettings.key, set: { value: s.value } });
            logSql('site_setting', settingData);
        }
        console.log(`✅ Migrated ${oldSettings.length} Settings.`);

        // --- 4. LOCATIONS ---
        console.log('📍 Migrating Locations...');
        const oldLocations = await sourceSql`SELECT * FROM location`;
        for (const l of oldLocations) {
            const locData = {
                countryName: l.country_name,
                countryCode: l.country_code,
                address: l.address,
                phoneNumber: l.phone_number,
                latitude: l.latitude,
                longitude: l.longitude
            };
            await db.insert(schema.location).values(locData);
            logSql('location', locData);
        }
        console.log(`✅ Migrated ${oldLocations.length} Locations.`);

        // --- 5. PAGE CONTENT ---
        console.log('📄 Migrating Page Content...');
        const oldContent = await sourceSql`SELECT * FROM page_content`;
        for (const c of oldContent) {
            const newMediaId = c.media_id ? idMaps.media.get(c.media_id) : null;
            
            const contentData = {
                page: c.page,
                section: c.section,
                title: c.title,
                text: c.text,
                mediaId: newMediaId
            };

            await db.insert(schema.pageContent).values(contentData)
                .onConflictDoUpdate({ target: [schema.pageContent.section], set: contentData });
            
            logSql('page_content', contentData);
        }
        console.log(`✅ Migrated ${oldContent.length} Page Content Blocks.`);

        // --- 6. TEAM MEMBERS ---
        console.log('👥 Migrating Team Members...');
        const oldTeam = await sourceSql`SELECT * FROM team_member`;
        for (const t of oldTeam) {
            const newMediaId = t.media_id ? idMaps.media.get(t.media_id) : null;
            const teamData = {
                name: t.name,
                title: t.title,
                bio: t.bio,
                mediaId: newMediaId
            };
            await db.insert(schema.teamMember).values(teamData);
            logSql('team_member', teamData);
        }
        console.log(`✅ Migrated ${oldTeam.length} Team Members.`);

        // --- 7. DOCUMENTS & LEADS ---
        console.log('📁 Migrating Documents...');
        const oldDocs = await sourceSql`SELECT * FROM document`;
        for (const d of oldDocs) {
            const newThumbnailId = d.thumbnail_media_id ? idMaps.media.get(d.thumbnail_media_id) : null;
            const [newDoc] = await db.insert(schema.document).values({
                title: d.title,
                description: d.description,
                fileUrl: d.file_url,
                isGated: d.is_gated,
                thumbnailMediaId: newThumbnailId,
                createdAt: d.created_at
            }).returning();
            
            idMaps.documents.set(d.id, newDoc.id);
            logSql('document', { ...newDoc, id: newDoc.id });
        }
        
        const oldDocLeads = await sourceSql`SELECT * FROM gated_document_lead`;
        for (const l of oldDocLeads) {
            const newDocId = idMaps.documents.get(l.document_id);
            if (newDocId) {
                const leadData = {
                    documentId: newDocId,
                    email: l.email,
                    submittedAt: l.submitted_at
                };
                await db.insert(schema.gatedDocumentLead).values(leadData);
                logSql('gated_document_lead', leadData);
            }
        }
        console.log(`✅ Migrated Documents & Leads.`);

        // --- 8. SOLUTIONS ---
        console.log('💡 Migrating Solutions...');
        const oldSolutions = await sourceSql`SELECT * FROM solution`;
        for (const s of oldSolutions) {
            const newMediaId = s.media_id ? idMaps.media.get(s.media_id) : null;

            const [newS] = await db.insert(schema.solution).values({
                slug: s.slug,
                solutionName: s.solution_name,
                shortDescription: s.short_description,
                longDescription: s.long_description, 
                mediaId: newMediaId,
                ctaText: s.cta_text,
                ctaLink: s.cta_link
            }).returning();
            idMaps.solutions.set(s.id, newS.id);
            logSql('solution', { ...newS, id: newS.id });
        }
        console.log(`✅ Migrated ${oldSolutions.length} Solutions.`);

        // --- 9. CLIENTS & TESTIMONIALS ---
        console.log('🤝 Migrating Clients...');
        const oldClients = await sourceSql`SELECT * FROM client`;
        
        for (const c of oldClients) {
            const newMediaId = c.media_id ? idMaps.media.get(c.media_id) : null;
            const [newClient] = await db.insert(schema.client).values({
                name: c.name,
                mediaId: newMediaId
            }).returning();
            idMaps.clients.set(c.id, newClient.id);
            logSql('client', { ...newClient, id: newClient.id });
        }

        const oldTestimonials = await sourceSql`SELECT * FROM testimonial`;
        for (const t of oldTestimonials) {
            const newClientId = idMaps.clients.get(t.client_id);
            if (newClientId) {
                const testData = {
                    clientId: newClientId,
                    quote: t.quote,
                    authorName: t.author_name,
                    authorTitle: t.author_title,
                    status: t.status,
                    submissionToken: t.submission_token,
                    tokenExpiresAt: t.token_expires_at
                };
                await db.insert(schema.testimonial).values(testData);
                logSql('testimonial', testData);
            }
        }
        console.log(`✅ Migrated Clients & Testimonials.`);

        // --- 10. CASE STUDIES ---
        console.log('💼 Migrating Case Studies...');
        const oldCases = await sourceSql`SELECT * FROM case_study`;
        for (const c of oldCases) {
            const newClientId = idMaps.clients.get(c.client_id);
            const [newCase] = await db.insert(schema.caseStudy).values({
                slug: c.slug,
                title: c.title,
                clientId: newClientId,
                challenge: c.challenge,
                solution: c.solution
            }).returning();

            logSql('case_study', { ...newCase, id: newCase.id });

            const results = await sourceSql`SELECT * FROM case_study_result WHERE case_study_id = ${c.id}`;
            for (const r of results) {
                const resData = {
                    caseStudyId: newCase.id,
                    kpiName: r.kpi_name,
                    kpiValue: r.kpi_value
                };
                await db.insert(schema.caseStudyResult).values(resData);
                logSql('case_study_result', resData);
            }
        }
        console.log(`✅ Migrated ${oldCases.length} Case Studies.`);

        // --- 11. PRODUCTS ---
        console.log('📦 Migrating Products...');
        const oldProducts = await sourceSql`SELECT * FROM product`;
        
        for (const p of oldProducts) {
            const newMediaId = p.media_id ? idMaps.media.get(p.media_id) : null;

            const [newP] = await db.insert(schema.product).values({
                slug: p.slug,
                name: p.name,
                shortDescription: p.short_description,
                longDescription: p.long_description,
                type: p.type || 'physical', 
                mediaId: newMediaId,
            }).returning();
            
            logSql('product', { ...newP, id: newP.id });

            let priceUsd = 0;
            let priceZar = 0;
            if (p.prices) {
                priceUsd = Math.round((p.prices.USD || 0) * 100);
                priceZar = Math.round((p.prices.ZAR || 0) * 100);
            }

            const varData = {
                id: createId(),
                productId: newP.id,
                name: 'Default',
                sku: p.slug.toUpperCase().substring(0, 10),
                priceUsd: priceUsd,
                priceZar: priceZar,
                stock: p.stock_quantity || 0,
                isDefault: true
            };
            await db.insert(schema.productVariant).values(varData);
            logSql('product_variant', varData);
        }
        console.log(`✅ Migrated ${oldProducts.length} Products.`);

        // --- 12. BLOG POSTS ---
        console.log('📝 Migrating Blogs...');
        const oldPosts = await sourceSql`SELECT * FROM blog_post`;
        for (const p of oldPosts) {
            const newAuthorId = idMaps.users.get(p.author_id);
            const newMediaId = p.media_id ? idMaps.media.get(p.media_id) : null;

            if (newAuthorId) {
                const blogData = {
                    slug: p.slug,
                    title: p.title,
                    authorId: newAuthorId,
                    mediaId: newMediaId,
                    contentJson: p.content_json,
                    isPublished: p.is_published,
                    publishedAt: p.published_at ? new Date(p.published_at) : null,
                    createdAt: p.created_at ? new Date(p.created_at) : new Date()
                };
                await db.insert(schema.blogPost).values(blogData);
                logSql('blog_post', blogData);
            }
        }
        console.log(`✅ Migrated ${oldPosts.length} Blogs.`);

        // --- 13. TRACKED LINKS ---
        console.log('🔗 Migrating Tracked Links...');
        const oldLinks = await sourceSql`SELECT * FROM tracked_link`;
        for (const l of oldLinks) {
            const newUserId = idMaps.users.get(l.user_id);
            if (newUserId) {
                const [newL] = await db.insert(schema.trackedLink).values({
                    shortCode: l.short_code,
                    destinationUrl: l.destination_url,
                    description: l.description,
                    userId: newUserId,
                    createdAt: l.created_at
                }).returning();
                
                logSql('tracked_link', { ...newL, id: newL.id });

                const visits = await sourceSql`SELECT * FROM link_visit WHERE link_id = ${l.id}`;
                for (const v of visits) {
                    const visitData = {
                        linkId: newL.id,
                        ipCountry: v.ip_country,
                        browser: v.browser,
                        os: v.os,
                        deviceType: v.device_type,
                        referrer: v.referrer,
                        visitedAt: v.visited_at
                    };
                    await db.insert(schema.linkVisit).values(visitData);
                    logSql('link_visit', visitData);
                }
            }
        }
        console.log(`✅ Migrated ${oldLinks.length} Tracked Links.`);

        console.log('\n🎉 SUCCESS! Migration Complete (Audit Logs skipped).');
        console.log('💾 SQL Dump saved to: backup_migrated_data.sql');

    } catch (e) {
        console.error('\n❌ MIGRATION FAILED:', e);
    } finally {
        sqlStream.end();
        await sourceSql.end();
        await destClient.end();
    }
}

main();