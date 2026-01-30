import { ProductService } from '$lib/server/services/ProductService';
import { error } from '@sveltejs/kit';
import { applyPricing } from '$lib/server/pricing';

export async function load({ params }) {
    const { slug } = params;

    const service = new ProductService();
    const item = await service.getProductBySlug(slug);

    if (!item) {
        throw error(404, 'Product not found');
    }

    // Filter unapproved products
    if (item.approvalStatus !== 'approved') {
        throw error(404, 'Product not found');
    }

    // Apply dynamic pricing logic
    const productWithPricing = await applyPricing(item);

    return { product: productWithPricing };
}
