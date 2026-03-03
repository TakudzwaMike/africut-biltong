import { ProductService } from '$lib/server/services/ProductService';
import { applyPricing, getActiveSales } from '$lib/server/pricing';

export async function load() {
	const productService = new ProductService();

	// 1. Parallel queries using ProductService
	const [hardware, software, services, randomHeroProduct] = await Promise.all([
		productService.listProducts({ type: 'physical', limit: 4 }),
		productService.listProducts({ type: 'digital', limit: 4 }),
		productService.listProducts({ type: 'service', limit: 4 }),
		productService.listProducts({ limit: 1 })
	]);

	// 2. Fetch Pricing Context once
	const pricingContext = await getActiveSales();

	// 3. Apply Pricing
	const [hardwareP, softwareP, servicesP] = await Promise.all([
		applyPricing(hardware.products || [], pricingContext),
		applyPricing(software.products || [], pricingContext),
		applyPricing(services.products || [], pricingContext)
	]);

	return {
		collections: {
			hardware: hardwareP,
			software: softwareP,
			services: servicesP
		},
		heroImage: randomHeroProduct.products[0]?.featuredImage
	};
}
