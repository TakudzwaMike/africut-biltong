import { db } from '$lib/server/db';
import { product } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

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

    return { products };
}