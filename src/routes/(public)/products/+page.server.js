import { db } from '$lib/server/db';
import { product } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import { applyPricing } from '$lib/server/pricing';

export async function load() {
    // Fetch products with their Featured Image and Default Variant (for pricing)
    const products = await db.query.product.findMany({
        orderBy: desc(product.createdAt),
        with: {
            featuredImage: true,
            variants: {
                where: (variants, { eq }) => eq(variants.isDefault, true)
            }
        }
    });

    // Apply dynamic pricing logic (Sale Events)
    const productsWithPricing = await applyPricing(products);

    return { products: productsWithPricing };
}
