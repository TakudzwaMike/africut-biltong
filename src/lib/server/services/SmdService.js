import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { product, productVariant, media, productImage, supplier, productSupplier } from '$lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { LoggerService } from '$lib/server/services/LoggerService';
import { PricingService } from '$lib/server/services/PricingService';

const logger = LoggerService.for('SmdService');

export class SmdService {
    constructor() {
        this.token = env.SMD_API_TOKEN || process.env.SMD_API_TOKEN;
        this.clientKey = env.SMD_CLIENT_ACCESS_KEY || process.env.SMD_CLIENT_ACCESS_KEY;
        this.baseUrl = 'https://api.smdtechnologies.com/v1';
        this.pricingService = new PricingService();
    }

    /**
     * Run the full catalog synchronization from SMD API to database
     * @returns {Promise<{success: boolean, processedCount: number}>}
     */
    async syncCatalog() {
        if (!this.token || !this.clientKey) {
            throw new Error('SMD API credentials (SMD_API_TOKEN, SMD_CLIENT_ACCESS_KEY) are not configured.');
        }

        logger.info('Initializing SMD Technologies catalog sync');

        // Fetch paginated catalog resources
        const [products, mediaList, prices, stockList] = await Promise.all([
            this._fetchPaginatedData('products'),
            this._fetchPaginatedData('media'),
            this._fetchPaginatedData('prices'),
            this._fetchPaginatedData('stock')
        ]);

        logger.info(`API Data fetched: ${products.length} products, ${mediaList.length} media items, ${prices.length} prices, ${stockList.length} stock levels`);

        // Check/create supplier record
        let smdSupplier = await db.query.supplier.findFirst({
            where: eq(supplier.name, 'SMD Technologies')
        });

        if (!smdSupplier) {
            const [newSupplier] = await db.insert(supplier).values({
                name: 'SMD Technologies',
                contactEmail: 'support@smdtechnologies.com',
                defaultMarkup: 40,
                currency: 'ZAR'
            }).returning();
            smdSupplier = newSupplier;
            logger.info('Registered new supplier: SMD Technologies with 40% default markup');
        } else if (smdSupplier.defaultMarkup !== 40) {
            await db.update(supplier)
                .set({ defaultMarkup: 40 })
                .where(eq(supplier.id, smdSupplier.id));
            logger.info('Updated SMD Technologies supplier default markup to 40%');
        }

        // Map auxiliary details by SKU or Product ID for lookup
        const mediaMap = new Map();
        for (const m of mediaList) {
            const key = m.sku || m.productId || m.productCode;
            if (key) {
                const keyStr = String(key);
                if (!mediaMap.has(keyStr)) {
                    mediaMap.set(keyStr, []);
                }
                mediaMap.get(keyStr).push(m);
            }
        }

        const priceMap = new Map();
        for (const p of prices) {
            const key = p.sku || p.productId || p.productCode;
            if (key) {
                const rawPrice = parseFloat(p.price || p.amount || 0);
                priceMap.set(String(key), Math.round(rawPrice * 100)); // Store as ZAR cents
            }
        }

        const stockMap = new Map();
        for (const s of stockList) {
            const key = s.sku || s.productId || s.productCode;
            if (key) {
                stockMap.set(String(key), parseInt(s.stock || s.quantity || 0, 10));
            }
        }

        let syncedCount = 0;

        for (const p of products) {
            // Find identifier to match details
            const rawId = p.id ? String(p.id) : null;
            const skuKey = p.sku || p.code || rawId;

            if (!skuKey) {
                logger.warn('Skipping product item: missing SKU/code identifier', p);
                continue;
            }

            const key = String(skuKey);
            const pName = p.name || p.title || `SMD Product ${key}`;
            const pDesc = p.shortDescription || p.description || '';
            const pSlug = p.slug || pName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + key.toLowerCase();

            // Match details from maps (try SKU key first, then raw product ID)
            const costPriceZarCents = priceMap.get(key) || (rawId ? priceMap.get(rawId) : 0) || 0;
            const stockLevel = stockMap.get(key) || (rawId ? stockMap.get(rawId) : 0) || 0;

            await db.transaction(async (tx) => {
                // 1. Sync Product
                let prodRecord = await tx.query.product.findFirst({
                    where: eq(product.slug, pSlug)
                });

                let productId;
                if (prodRecord) {
                    productId = prodRecord.id;
                    await tx.update(product)
                        .set({
                            name: pName,
                            shortDescription: pDesc,
                            approvalStatus: 'approved',
                            updatedAt: new Date()
                        })
                        .where(eq(product.id, productId));
                } else {
                    const [newProd] = await tx.insert(product).values({
                        name: pName,
                        slug: pSlug,
                        shortDescription: pDesc,
                        approvalStatus: 'approved'
                    }).returning();
                    productId = newProd.id;
                }

                // 2. Sync Product Variant
                let variantRecord = await tx.query.productVariant.findFirst({
                    where: eq(productVariant.productId, productId)
                });

                let variantId;
                if (variantRecord) {
                    variantId = variantRecord.id;
                    await tx.update(productVariant)
                        .set({
                            sku: key,
                            stock: stockLevel
                        })
                        .where(eq(productVariant.id, variantId));
                } else {
                    const [newVar] = await tx.insert(productVariant).values({
                        productId,
                        name: 'Default',
                        sku: key,
                        stock: stockLevel,
                        isDefault: true
                    }).returning();
                    variantId = newVar.id;
                }

                // 3. Sync Product Supplier Pricing
                let supplierLink = await tx.query.productSupplier.findFirst({
                    where: and(
                        eq(productSupplier.variantId, variantId),
                        eq(productSupplier.supplierId, smdSupplier.id)
                    )
                });

                if (supplierLink) {
                    await tx.update(productSupplier)
                        .set({
                            supplierSku: key,
                            rawPrice: costPriceZarCents,
                            isOnFile: true,
                            updatedAt: new Date()
                        })
                        .where(eq(productSupplier.id, supplierLink.id));
                } else {
                    await tx.insert(productSupplier).values({
                        variantId,
                        supplierId: smdSupplier.id,
                        supplierSku: key,
                        rawPrice: costPriceZarCents,
                        isOnFile: true
                    });
                }

                // 4. Sync Product Images
                const mediaItems = mediaMap.get(key) || (rawId ? mediaMap.get(rawId) : []) || [];
                const savedMediaIds = [];

                for (const m of mediaItems) {
                    const mediaUrl = m.url || m.imageUrl || m.mediaUrl;
                    if (!mediaUrl) continue;

                    let existingMedia = await tx.query.media.findFirst({
                        where: eq(media.originalUrl, mediaUrl)
                    });

                    let mediaId;
                    if (existingMedia) {
                        mediaId = existingMedia.id;
                    } else {
                        const [newMedia] = await tx.insert(media).values({
                            altText: m.altText || pName,
                            originalUrl: mediaUrl,
                            displayUrl: mediaUrl,
                            thumbnailUrl: m.thumbnailUrl || mediaUrl,
                            width: 800,
                            height: 800
                        }).returning();
                        mediaId = newMedia.id;
                    }
                    savedMediaIds.push(mediaId);
                }

                if (savedMediaIds.length > 0) {
                    // Update main featured image
                    await tx.update(product)
                        .set({ mediaId: savedMediaIds[0] })
                        .where(eq(product.id, productId));

                    // Add to product gallery
                    await tx.delete(productImage).where(eq(productImage.productId, productId));
                    await tx.insert(productImage).values(
                        savedMediaIds.map((mId, index) => ({
                            productId,
                            mediaId: mId,
                            displayOrder: index
                        }))
                    );
                }

                // 5. Update Retail Pricing
                await this.pricingService.updateVariantPricing(variantId);
            });

            syncedCount++;
        }

        logger.info(`SMD Technologies sync completed. Synced ${syncedCount} products.`);
        return { success: true, processedCount: syncedCount };
    }

    /**
     * Retrieve all paginated items from a specific endpoint
     * @private
     */
    async _fetchPaginatedData(endpoint) {
        let items = [];
        let page = 1;
        let numberOfPages = 1;

        do {
            const url = `${this.baseUrl}/${endpoint}?page=${page}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'ClientAccessKey': this.clientKey
                }
            });

            if (!response.ok) {
                throw new Error(`SMD API fetch failed on ${endpoint} page ${page}: ${response.statusText}`);
            }

            const result = await response.json();
            items = items.concat(result.data || []);
            numberOfPages = result.numberOfPages || 1;
            page++;
        } while (page <= numberOfPages);

        return items;
    }
}
