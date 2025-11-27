import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { product } from '$lib/server/db/schema';
import { ilike, or, desc } from 'drizzle-orm';
import { applyPricing } from '$lib/server/pricing'; // Import pricing logic

export async function GET({ url }) {
    const query = url.searchParams.get('q');

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
        return json({ error: 'A search query of at least 2 characters is required.' }, { status: 400 });
    }

    const searchQuery = `%${query}%`;

    try {
        // Search products by name, description
        const products = await db.query.product.findMany({
            where: or(
                ilike(product.name, searchQuery),
                ilike(product.shortDescription, searchQuery)
            ),
            limit: 12,
            orderBy: desc(product.createdAt),
            with: {
                // Fetch featured image
                featuredImage: true,
                // Fetch variants to show price
                variants: {
                    orderBy: (variants, { desc }) => [desc(variants.isDefault)]
                }
            }
        });

        // Apply dynamic pricing (Sale Events) to search results
        const productsWithPricing = await applyPricing(products);

        return json(productsWithPricing);
    } catch (e) {
        console.error("Product search failed:", e);
        return json({ error: 'An error occurred while searching for products.' }, { status: 500 });
    }
}
