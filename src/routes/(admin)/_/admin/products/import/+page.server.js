import { db } from '$lib/server/db';
import { product, productVariant } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { parseCsv } from '$lib/server/csv';
import { eq } from 'drizzle-orm';
import { log } from '$lib/server/auditLog';

export const actions = {
    default: async ({ request, locals }) => {
        if (!locals.user || !['admin', 'store_manager'].includes(locals.user.role)) {
            return fail(403, { message: 'Unauthorized' });
        }

        const formData = await request.formData();
        const file = formData.get('csvFile');

        if (!file || file.size === 0) {
            return fail(400, { message: 'Please upload a valid CSV file.' });
        }

        try {
            const text = await file.text();
            const rows = parseCsv(text);

            // Expected Header Index
            // 0:Product ID, 1:Name, 2:Slug, 3:Type, 4:Description
            // 5:Variant ID, 6:Var Name, 7:SKU, 8:Stock, 9:USD, 10:ZAR

            // Skip header
            const dataRows = rows.slice(1).filter(r => r.length > 2); // Basic filter for empty lines

            let stats = { created: 0, updated: 0, skipped: 0 };

            await db.transaction(async (tx) => {
                for (const row of dataRows) {
                    // Extract Core Data
                    // We rely on SLUG as the unique identifier for Products during import
                    const pName = row[1];
                    const pSlug = row[2];
                    const pType = row[3] || 'physical';
                    const pDesc = row[4];

                    if (!pSlug) {
                        stats.skipped++;
                        continue;
                    }

                    // 1. UPSERT PRODUCT
                    let productId;
                    const existingProduct = await tx.query.product.findFirst({
                        where: eq(product.slug, pSlug)
                    });

                    if (existingProduct) {
                        productId = existingProduct.id;
                        // Optional: Update product details if they changed?
                        // For now, let's assume CSV is authority on details too.
                        await tx.update(product).set({
                            name: pName,
                            type: pType,
                            shortDescription: pDesc,
                            updatedAt: new Date()
                        }).where(eq(product.id, productId));
                    } else {
                        const [newProd] = await tx.insert(product).values({
                            name: pName,
                            slug: pSlug,
                            type: pType,
                            shortDescription: pDesc
                        }).returning();
                        productId = newProd.id;
                        stats.created++;
                    }

                    // 2. UPSERT VARIANT
                    const vName = row[6] || 'Default';
                    const vSku = row[7];
                    const vStock = row[8] ? parseInt(row[8]) : null;
                    const vPriceUsd = row[9] ? parseInt(row[9]) : null;
                    const vPriceZar = row[10] ? parseInt(row[10]) : null;

                    // We identify variants by SKU if present, otherwise by Name + ProductID
                    let existingVariant = null;
                    
                    if (vSku) {
                        existingVariant = await tx.query.productVariant.findFirst({
                            where: eq(productVariant.sku, vSku)
                        });
                    }

                    // Fallback: Check by Name within Product if SKU matched nothing or wasn't provided
                    if (!existingVariant) {
                        const variants = await tx.query.productVariant.findMany({
                            where: eq(productVariant.productId, productId)
                        });
                        existingVariant = variants.find(v => v.name === vName);
                    }

                    if (existingVariant) {
                        await tx.update(productVariant).set({
                            name: vName,
                            sku: vSku,
                            stock: vStock,
                            priceUsd: vPriceUsd,
                            priceZar: vPriceZar,
                            isDefault: existingVariant.isDefault // Preserve default status
                        }).where(eq(productVariant.id, existingVariant.id));
                        stats.updated++;
                    } else {
                        await tx.insert(productVariant).values({
                            productId,
                            name: vName,
                            sku: vSku,
                            stock: vStock,
                            priceUsd: vPriceUsd,
                            priceZar: vPriceZar,
                            isDefault: false // New variants from CSV defaults to false unless logic added
                        });
                        stats.updated++; // Treating variant addition as an update to the product line
                    }
                }
            });

            await log(locals.user.id, 'import_products', { stats });

            return { success: true, message: `Import Complete: ${stats.created} Products Created, ${stats.updated} Variants Processed.` };

        } catch (error) {
            console.error('Import failed:', error);
            return fail(500, { message: `Import failed: ${error.message}` });
        }
    }
};
