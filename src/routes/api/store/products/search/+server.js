import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { product, productVariant } from '$lib/server/db/schema';
import { ilike, or, sql, desc } from 'drizzle-orm';

export async function GET({ url }) {
    const query = url.searchParams.get('q');

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
        return json({ error: 'A search query of at least 2 characters is required.' }, { status: 400 });
    }

    const searchQuery = `%${query}%`;

    try {
        // Search products by name, description, or tags
        const products = await db.query.product.findMany({
            where: or(
                ilike(product.name, searchQuery),
                ilike(product.shortDescription, searchQuery),
                // Note: Drizzle currently needs raw SQL for array searching in some drivers, 
                // but simple text search on name/desc covers 90% of use cases.
                // We can add tag search if needed:
                // sql`array_to_string(${product.tags}, ' ') ilike ${searchQuery}`
            ),
            limit: 12,
            with: {
                // Fetch featured image
                featuredImage: true,
                // Fetch variants to show price
                variants: {
                    limit: 1,
                    orderBy: (variants, { desc }) => [desc(variants.isDefault)]
                }
            }
        });

        return json(products);
    } catch (e) {
        console.error("Product search failed:", e);
        return json({ error: 'An error occurred while searching for products.' }, { status: 500 });
    }
}