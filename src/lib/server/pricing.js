import { db } from '$lib/server/db';
import { saleEvent, salePrice } from '$lib/server/db/schema';
import { and, eq, lte, gte, inArray } from 'drizzle-orm';

/**
 * Fetches all currently active sale events and their associated prices.
 * @returns {Promise<{events: any[], prices: any[]}>}
 */
export async function getActiveSales() {
    const now = new Date();
    
    // 1. Find active events based on date range and active flag
    const activeEvents = await db.select().from(saleEvent).where(and(
        eq(saleEvent.isActive, true),
        lte(saleEvent.startsAt, now),
        gte(saleEvent.endsAt, now)
    ));

    if (activeEvents.length === 0) {
        return { events: [], prices: [] };
    }

    const eventIds = activeEvents.map(e => e.id);

    // 2. Find all prices linked to these events
    const prices = await db.select().from(salePrice).where(
        inArray(salePrice.eventId, eventIds)
    );

    return { events: activeEvents, prices };
}

/**
 * Enriches a product or list of products with calculated pricing.
 * Modifies the variants in-place to add 'effectivePrice', 'isOnSale', etc.
 * 
 * @param {any | any[]} products - Single product object or array of products. Must include 'variants'.
 * @param {object} context - Optional pre-fetched result from getActiveSales().
 */
export async function applyPricing(products, context = null) {
    // Handle single object or array
    const isArray = Array.isArray(products);
    const productList = isArray ? products : [products];
    
    if (productList.length === 0) return products;

    // Ensure context exists
    const { events, prices } = context || await getActiveSales();
    
    // Create a map for fast lookup: variantId -> [prices]
    const priceMap = {};
    if (prices.length > 0) {
        prices.forEach(p => {
            if (!priceMap[p.variantId]) priceMap[p.variantId] = [];
            priceMap[p.variantId].push(p);
        });
    }

    // Apply logic to every variant
    productList.forEach(p => {
        if (!p.variants) return;

        p.variants.forEach(v => {
            // Default state: Effective price is the base price
            let bestPriceUsd = v.priceUsd;
            let bestPriceZar = v.priceZar;
            
            let isOnSale = false;
            let activeEventLabel = null;

            const variantSalePrices = priceMap[v.id];

            if (variantSalePrices) {
                variantSalePrices.forEach(sp => {
                    // Check USD Logic
                    if (sp.salePriceUsd !== null && (bestPriceUsd === null || sp.salePriceUsd < bestPriceUsd)) {
                        bestPriceUsd = sp.salePriceUsd;
                        isOnSale = true;
                    }
                    // Check ZAR Logic
                    if (sp.salePriceZar !== null && (bestPriceZar === null || sp.salePriceZar < bestPriceZar)) {
                        bestPriceZar = sp.salePriceZar;
                        isOnSale = true;
                    }

                    // Determine which label to show (Priority to the event providing the lowest price is complex, 
                    // so we just take the label of the event triggering the sale flag for simplicity)
                    if (isOnSale && !activeEventLabel) {
                        const event = events.find(e => e.id === sp.eventId);
                        if (event) activeEventLabel = event.publicLabel;
                    }
                });
            }

            // Attach computed fields to the variant object
            v.effectivePriceUsd = bestPriceUsd;
            v.effectivePriceZar = bestPriceZar;
            
            // Only set compareAtPrice if it's actually different
            v.compareAtPriceUsd = (isOnSale && v.priceUsd > bestPriceUsd) ? v.priceUsd : null;
            v.compareAtPriceZar = (isOnSale && v.priceZar > bestPriceZar) ? v.priceZar : null;
            
            v.isOnSale = isOnSale;
            v.saleBadge = activeEventLabel;
        });
    });

    return isArray ? productList : productList[0];
}
