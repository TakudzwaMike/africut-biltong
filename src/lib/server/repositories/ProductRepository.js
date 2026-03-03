import { db } from '$lib/server/db';
import { product, media, productImage, productVariant, productFeature, solutionsToProducts, solution, productSupplier } from '$lib/server/db/schema.js';
import { desc, eq, or, and, ilike, count, asc, sql, isNotNull, lte } from 'drizzle-orm';
import { log } from '$lib/server/auditLog.js';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('ProductRepository');


export class ProductRepository {
    /**
     * Fetch multiple products with pagination and search.
     * @param {object} params
     * @param {number} params.page
     * @param {number} params.limit
     * @param {string} [params.query]
     * @returns {Promise<{ products: any[], totalItems: number, totalPages: number }>}
     */
    async findMany({ page = 1, limit = 20, query = null, type = null, approvalStatus = null } = {}) {
        const offset = (page - 1) * limit;

        let filters = undefined;
        if (query) {
            const searchStr = `%${query}%`;
            filters = or(
                ilike(product.name, searchStr),
                ilike(product.slug, searchStr)
            );
        }

        if (type) {
            const typeFilter = eq(product.type, type);
            // Combine with existing filters if any
            filters = filters ? and(filters, typeFilter) : typeFilter;
        }

        if (approvalStatus) {
            const statusFilter = eq(product.approvalStatus, approvalStatus);
            filters = filters ? and(filters, statusFilter) : statusFilter;
        }

        const [products, totalResult] = await Promise.all([
            db.query.product.findMany({
                where: filters,
                orderBy: desc(product.id),
                limit: limit,
                offset: offset,
                with: {
                    featuredImage: true,
                    variants: {
                        with: { supplierLinks: true }
                    },
                    features: { orderBy: (f, { asc }) => [asc(f.displayOrder)] },
                    solutions: true,
                    images: {
                        with: { media: true },
                        orderBy: (img, { asc }) => [asc(img.displayOrder)]
                    }
                }
            }),
            db.select({ count: count() }).from(product).where(filters)
        ]);

        const totalItems = totalResult[0].count;
        const totalPages = Math.ceil(totalItems / limit);

        return { products, totalItems, totalPages };
    }

    async findAll() {
        return db.query.product.findMany({
            orderBy: desc(product.id),
            with: {
                variants: true
            }
        });
    }

    /**
     * Find a single product by ID.
     * @param {number} id 
     */
    async findById(id) {
        return db.query.product.findFirst({ where: eq(product.id, id) });
    }

    async findBySlug(slug) {
        return db.query.product.findFirst({
            where: eq(product.slug, slug),
            with: {
                variants: true,
                featuredImage: true,
                images: { with: { media: true } },
                features: { orderBy: (f, { asc }) => [asc(f.displayOrder)] },
                solutions: {
                    with: {
                        solution: { with: { featuredImage: true } }
                    }
                }
            }
        });
    }

    async count() {
        const result = await db.select({ count: count() }).from(product);
        return result[0]?.count || 0;
    }

    async findLowStock(limit = 5) {
        return db.query.productVariant.findMany({
            where: and(
                eq(productVariant.isDefault, false), // Often default is just a placeholder
                lte(productVariant.stock, 10)
            ),
            with: { product: true },
            limit: limit
        });
    }

    async findRandomWithImage() {
        return db.query.product.findFirst({
            where: isNotNull(product.mediaId),
            orderBy: sql`RANDOM()`,
            with: { featuredImage: true }
        });
    }

    /**
     * Create a new product.
     * @param {object} data
     * @param {object} locals - specific mostly for audit logging user
     */
    async create(data, userId) {
        const {
            name, slug, shortDescription, longDescription,
            mediaId, ctaText, ctaLink, type,
            galleryImageIds, solutionIds, features, variants
        } = data;

        const dataToSave = {
            name: String(name),
            slug: String(slug),
            shortDescription: String(shortDescription),
            longDescription,
            mediaId: mediaId ? Number(mediaId) : null,
            ctaText: String(ctaText) || null,
            ctaLink: String(ctaLink) || null,
            type: String(type)
        };

        const [newProduct] = await db.insert(product).values(dataToSave).returning();

        await log(userId, 'create_product', {
            targetId: newProduct.id,
            data: { name: newProduct.name }
        });

        await this._syncRelations(newProduct.id, { galleryImageIds, solutionIds, features, variants });

        return newProduct;
    }

    /**
     * Update an existing product.
     * @param {number} id
     * @param {object} data
     * @param {object} locals
     */
    async update(id, data, userId) {
        const {
            name, slug, shortDescription, longDescription,
            mediaId, ctaText, ctaLink, type,
            galleryImageIds, solutionIds, features, variants
        } = data;

        const dataToSave = {
            name: String(name),
            slug: String(slug),
            shortDescription: String(shortDescription),
            longDescription,
            mediaId: mediaId ? Number(mediaId) : null,
            ctaText: String(ctaText) || null,
            ctaLink: String(ctaLink) || null,
            type: String(type)
        };

        await db.update(product).set(dataToSave).where(eq(product.id, id));

        await log(userId, 'update_product', {
            targetId: id,
            data: { name: dataToSave.name }
        });

        await this._syncRelations(id, { galleryImageIds, solutionIds, features, variants });

        return { id, ...dataToSave };
    }

    /**
     * Delete a product.
     * @param {number} id 
     * @param {object} locals 
     */
    async delete(id, userId) {
        const productToDelete = await this.findById(id);
        if (!productToDelete) return false;

        await db.delete(product).where(eq(product.id, id));

        await log(userId, 'delete_product', { targetId: id, data: productToDelete });

        return true;
    }

    /**
     * Internal helper to sync related tables.
     */
    async _syncRelations(productId, { galleryImageIds = [], solutionIds = [], features = [], variants = [] }) {
        // 1. Gallery Images
        await db.delete(productImage).where(eq(productImage.productId, productId));
        if (galleryImageIds.length > 0) {
            await db.insert(productImage).values(
                galleryImageIds.map((mediaId, index) => ({
                    productId,
                    mediaId,
                    displayOrder: index
                }))
            );
        }

        // 2. Smart Links (Solutions)
        await db.delete(solutionsToProducts).where(eq(solutionsToProducts.productId, productId));
        if (solutionIds.length > 0) {
            await db.insert(solutionsToProducts).values(
                solutionIds.map(solId => ({ solutionId: solId, productId }))
            );
        }

        // 3. Features
        await db.delete(productFeature).where(eq(productFeature.productId, productId));
        if (features.length > 0) {
            await db.insert(productFeature).values(
                features.map((f, i) => ({
                    productId,
                    icon: f.icon,
                    text: f.text,
                    displayOrder: i
                }))
            );
        }

        // 4. Variants
        if (variants.length > 0) {
            // Note: This logic for variants is simplified. 
            // Ideally, we might want to delete missing variants or handle updates more carefully.
            // For now, we follow the existing logic which updates if ID exists, inserts if not.
            // But strict sync usually implies removing orphans. The original code didn't explicitly delete orphans,
            // so we'll stick to upsert behavior for now to minimize risk suitable for this refactor.

            for (const v of variants) {
                const vData = {
                    productId,
                    name: v.name,
                    sku: v.sku,
                    priceUsd: v.priceUsd ? Math.round(parseFloat(v.priceUsd) * 100) : null,
                    priceZar: v.priceZar ? Math.round(parseFloat(v.priceZar) * 100) : null,
                    stock: v.stock ? parseInt(v.stock) : null,
                    isDefault: v.isDefault,
                    shippingFlatRate: v.shippingFlatRate ? Math.round(parseFloat(v.shippingFlatRate) * 100) : 0
                };

                let variantId = v.id;
                if (v.id && typeof v.id === 'string' && !v.id.startsWith('new-')) {
                    await db.update(productVariant).set(vData).where(eq(productVariant.id, v.id));
                } else {
                    const [newVar] = await db.insert(productVariant).values(vData).returning();
                    variantId = newVar.id;
                }

                // Sync Supplier Link if provided
                if (v.supplierId && v.rawPrice) {
                    // Start by checking if link exists
                    // Ideally we'd inject SupplierService, but for tight coupling in this monolithic repo method for now:
                    // We need to import 'productSupplier' near top if not already imported or use db.insert directly
                    // It is imported.

                    // Delete existing for this variant to keep it simple (1:1 enforced here via UI mostly)
                    // Or Upsert

                    // Simple Delete-Insert strategy for this specific variant-supplier link if we want only one active supplier per variant "conceptually" in UI
                    // But data model allows many. Let's just assume we are setting "The" supplier for this edit.
                    // To avoid duplicates, let's delete all for this variant first if we want strict 1 supplier, OR just append.
                    // For now, let's just insert/update the specific one.
                    // Actually, simple robust way: Delete all for variant, insert new.
                    // This assumes we only support one supplier per variant in the UI for now.

                    const supplierData = {
                        variantId,
                        supplierId: parseInt(v.supplierId),
                        rawPrice: Math.round(parseFloat(v.rawPrice) * 100), // Cents (stored as integer)
                        supplierSku: v.supplierSku || ''
                    };

                    // Check existence
                    // Importing eq, and if needed.
                    // For expedience in this refactor, let's just delete previous for this variant
                    // CAUTION: This wipes history of other suppliers if we supported multiple.
                    // Let's assume 1 supplier for now as per UI requirements ("Select Supplier").

                    // Need to import productSupplier at top if not there. It is there.
                    // We also need to be careful not to break imports.

                    // Let's do a safe upset if possible, or delete-insert.
                    // Deleting all for variant ensures we clean up if they changed supplier.
                    await db.delete(productSupplier).where(eq(productSupplier.variantId, variantId));
                    await db.insert(productSupplier).values(supplierData);
                }
            }
        }
    }

    async updateVariant(variantId, data) {
        await db.update(productVariant).set(data).where(eq(productVariant.id, variantId));
    }

    async bulkUpsert(rows) {
        let stats = { created: 0, updated: 0, skipped: 0 };

        await db.transaction(async (tx) => {
            for (const row of rows) {
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
                        isDefault: false
                    });
                    stats.updated++;
                }
            }
        });

        return stats;
    }
}
