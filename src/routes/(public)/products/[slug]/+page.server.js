import { db } from '$lib/server/db';
import { product } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { applyPricing } from '$lib/server/pricing';

export async function load({ params }) {
    const { slug } = params;

    const item = await db.query.product.findFirst({
        where: eq(product.slug, slug),
        with: {
            variants: true,
            featuredImage: true,
            images: { with: { media: true } }, // Gallery
            features: true,
            solutions: {
                with: {
                    solution: { with: { featuredImage: true } }
                }
            }
        }
    });

    if (!item) throw error(404, 'Product not found');

    // Apply dynamic pricing logic
    const productWithPricing = await applyPricing(item);

    return { product: productWithPricing };
}
