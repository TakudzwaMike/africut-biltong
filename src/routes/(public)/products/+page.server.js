import { ProductService } from '$lib/server/services/ProductService';
import { applyPricing } from '$lib/server/pricing';

export async function load() {
    const service = new ProductService();
    const result = await service.listProducts({ approvalStatus: 'approved' });
    // Need to handle pagination if list grows, but likely not >20 for now.
    // ProductRepository returns { products, ... }

    let products = result.products || [];

    // Filter default variants manually since Repo fetches all variants
    // Original code: variants: { where: (variants, { eq }) => eq(variants.isDefault, true) }
    // We replicate this filtering in JS
    products = products.map(p => ({
        ...p,
        variants: p.variants.filter(v => v.isDefault)
    }));

    // Apply dynamic pricing logic (Sale Events)
    const productsWithPricing = await applyPricing(products);

    return { products: productsWithPricing };
}
