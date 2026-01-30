import { WiseService } from '$lib/server/services/WiseService';
import { SupplierService } from '$lib/server/services/SupplierService';
import { ProductRepository } from '$lib/server/repositories/ProductRepository';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('PricingService');

export class PricingService {
    constructor() {
        this.wise = new WiseService();
        this.supplierService = new SupplierService();
        this.productRepo = new ProductRepository();

        // Configuration Constants
        this.GLOBAL_MARKUP_PERCENT = 20; // Default 20%
    }

    /**
     * Calculate retail prices for a variant based on supplier cost
     * @param {string} variantId 
     * @returns {Promise<{priceUsd: number, priceZar: number}>}
     */
    async calculateRetailPrice(variantId) {
        // 1. Get Variant & Supplier Data
        // Ideally we'd have a specialized repo method, but chaining services works for now
        const supplierLink = await this.supplierService.getSupplierForVariant(variantId);

        if (!supplierLink) {
            // No supplier, cannot auto-calc. Return current values?
            // Or throw error? For now, let's log and return nulls
            logger.warn(`No supplier link found for variant ${variantId}, skimming calculation`);
            return null;
        }

        const { rawPrice, supplier } = supplierLink;
        const supplierCurrency = supplier.currency || 'USD';

        // Get variant for shipping info (bit inefficient without joining, but clean architecture)
        // We need direct DB access for efficiency here, but let's assume we can get it via repo
        // TODO: Optimize queries
        // const variant = await this.productRepo.getVariant(variantId); 
        // Assuming rawPrice is what we have.

        // 2. Fetch Rates
        const [rateToUsd, rateToZar] = await Promise.all([
            this.wise.getRate(supplierCurrency, 'USD'),
            this.wise.getRate(supplierCurrency, 'ZAR')
        ]);

        // 3. Determine Markup
        // Use supplier markup if set, otherwise global
        // Note: Markup is stored as int 20 = 20%
        const markupPercent = supplier.defaultMarkup || this.GLOBAL_MARKUP_PERCENT;
        const multiplier = 1 + (markupPercent / 100);

        // 4. Calculate Base Prices (Cost * Rate * Multiplier)
        const baseUsd = (rawPrice * rateToUsd) * multiplier;
        const baseZar = (rawPrice * rateToZar) * multiplier;

        // 5. Add Shipping (Assumed flat rate is in USD for base simplicity or stored per variant?)
        // Schema says: shippingFlatRate integer, let's assume it's Cents in USD.
        // We need the variant to know this.
        // Let's rely on the caller to provide current shipping or fetch it?
        // Let's allow passing it in, or fetch it.
        // For prototype, assuming shipping is 0 or handled separately.

        // Rounding
        return {
            priceUsd: Math.round(baseUsd),
            priceZar: Math.round(baseZar)
        };
    }

    /**
     * Recalculate price for a specific variant and update DB
     */
    async updateVariantPricing(variantId) {
        const prices = await this.calculateRetailPrice(variantId);
        if (prices) {
            // We need to use ProductRepository to update variant
            // This method isn't exposed yet in standard generic repo.
            // We'll access db directly via repo or add method.
            // For now, assume this service will coordinate with ProductService or Repo.
            await this.productRepo.updateVariant(variantId, {
                priceUsd: prices.priceUsd,
                priceZar: prices.priceZar
            });
            logger.info(`Updated DB prices for ${variantId}`, prices);
        }
    }
}
