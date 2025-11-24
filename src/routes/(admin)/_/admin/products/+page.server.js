import { db } from '$lib/server/db';
import { product, media, productImage, productVariant, productFeature, solutionsToProducts, solution } from '$lib/server/db/schema.js';
import { desc, eq, or, ilike, count, asc } from 'drizzle-orm';
import { fail, error } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';

const ITEMS_PER_PAGE = 20;
const ALLOWED_ROLES = ['admin', 'store_manager'];

export async function load({ url, locals }) {
	// 1. Security Check
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden: You do not have permission to manage products.');
	}

	// 2. Pagination & Search Params
	const query = url.searchParams.get('q');
	const page = Number(url.searchParams.get('page')) || 1;
	const offset = (page - 1) * ITEMS_PER_PAGE;

	// 3. Filters
	let filters = undefined;
	if (query) {
		const searchStr = `%${query}%`;
		filters = or(
			ilike(product.name, searchStr),
			ilike(product.slug, searchStr)
		);
	}

	// 4. Parallel Queries
	const [products, totalResult, mediaItems, allSolutions] = await Promise.all([
		db.query.product.findMany({
			where: filters,
			orderBy: desc(product.id),
			limit: ITEMS_PER_PAGE,
			offset: offset,
			with: {
				featuredImage: true,
				variants: true,
				features: { orderBy: (f, { asc }) => [asc(f.displayOrder)] },
				solutions: true, // Needed for Smart Links
				images: {
					with: {
						media: true
					},
					orderBy: (img, { asc }) => [asc(img.displayOrder)]
				}
			}
		}),
		db.select({ count: count() }).from(product).where(filters),
		db.query.media.findMany({ orderBy: desc(media.uploadedAt) }),
		db.query.solution.findMany({ orderBy: desc(solution.solutionName) })
	]);

	const totalItems = totalResult[0].count;
	const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

	return { 
		products, 
		mediaItems,
		allSolutions,
		pagination: {
			page,
			totalPages,
			totalItems,
			query
		}
	};
}

export const actions = {
	save: async ({ request, locals }) => {
		// Security Check
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const galleryImageIds = formData.getAll('galleryImageIds').map(Number);
		const solutionIds = formData.getAll('solutionIds').map(Number);
		
		const {
			name,
			slug,
			shortDescription,
			longDescription: longDescriptionJson,
			ctaText,
			ctaLink,
			mediaId,
			type,
			// Complex JSON fields from frontend state
			variants: variantsJson,
			features: featuresJson
		} = Object.fromEntries(formData);

		if (!name || !slug) {
			return fail(400, { message: 'Name and Slug are required.' });
		}

		let longDescription = null;
		if (longDescriptionJson && typeof longDescriptionJson === 'string' && longDescriptionJson !== 'null') {
			try {
				longDescription = JSON.parse(longDescriptionJson);
			} catch (e) {
				return fail(400, { message: 'Invalid rich text format.' });
			}
		}

		let variants = [];
		try {
			if (variantsJson) variants = JSON.parse(String(variantsJson));
		} catch(e) { return fail(400, { message: 'Invalid variants data' }); }

		let features = [];
		try {
			if (featuresJson) features = JSON.parse(String(featuresJson));
		} catch(e) { return fail(400, { message: 'Invalid features data' }); }

		const dataToSave = {
			name: String(name),
			slug: String(slug),
			shortDescription: String(shortDescription),
			longDescription,
			mediaId: mediaId ? Number(mediaId) : null,
			ctaText: String(ctaText) || null,
			ctaLink: String(ctaLink) || null,
			type: String(type)
		};

		try {
			let targetId = id;

			if (isNaN(id) || !id) {
				// --- CREATE ---
				const [newProduct] = await db.insert(product).values(dataToSave).returning();
				targetId = newProduct.id;
				
				await log(locals.user?.id, 'create_product', {
					targetId: newProduct.id,
					data: { name: newProduct.name }
				});
			} else {
				// --- UPDATE ---
				await db.update(product).set(dataToSave).where(eq(product.id, id));
				
				await log(locals.user?.id, 'update_product', {
					targetId: id,
					data: { name: dataToSave.name }
				});
			}

			// --- SYNC RELATIONS (Common for Create & Update) ---
			
			// 1. Gallery Images
			await db.delete(productImage).where(eq(productImage.productId, targetId));
			if (galleryImageIds.length > 0) {
				await db.insert(productImage).values(
					galleryImageIds.map((mediaId, index) => ({
						productId: targetId,
						mediaId,
						displayOrder: index
					}))
				);
			}

			// 2. Smart Links (Solutions)
			await db.delete(solutionsToProducts).where(eq(solutionsToProducts.productId, targetId));
			if (solutionIds.length > 0) {
				await db.insert(solutionsToProducts).values(
					solutionIds.map(solId => ({ solutionId: solId, productId: targetId }))
				);
			}

			// 3. Features
			await db.delete(productFeature).where(eq(productFeature.productId, targetId));
			if (features.length > 0) {
				await db.insert(productFeature).values(
					features.map((f, i) => ({
						productId: targetId,
						icon: f.icon,
						text: f.text,
						displayOrder: i
					}))
				);
			}

			// 4. Variants
			for (const v of variants) {
				const vData = {
					productId: targetId,
					name: v.name,
					sku: v.sku,
					priceUsd: v.priceUsd ? Math.round(parseFloat(v.priceUsd) * 100) : null,
					priceZar: v.priceZar ? Math.round(parseFloat(v.priceZar) * 100) : null,
					stock: v.stock ? parseInt(v.stock) : null,
					isDefault: v.isDefault
				};

				if (v.id && typeof v.id === 'string') { 
					await db.update(productVariant).set(vData).where(eq(productVariant.id, v.id));
				} else {
					await db.insert(productVariant).values(vData);
				}
			}

			return { success: true, message: 'Product saved successfully.' };

		} catch (err) {
			console.error('Error saving product:', err);
			if (err.message.includes('duplicate key value violates unique constraint')) {
				return fail(400, { message: 'A product with this slug already exists.' });
			}
			return fail(500, { message: 'Could not save the product.' });
		}
	},

	delete: async ({ url, locals }) => {
		// Security Check
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const id = url.searchParams.get('id');
		if (!id) return fail(400, { message: 'Invalid request' });

		try {
			const productToDelete = await db.query.product.findFirst({ where: eq(product.id, Number(id)) });
			if (!productToDelete) return fail(404, { message: 'Product not found.' });

			await db.delete(product).where(eq(product.id, Number(id)));

			await log(locals.user?.id, 'delete_product', { targetId: id, data: productToDelete });

			return { status: 200, message: 'Product deleted successfully.' };
		} catch (err) {
			console.error(`Error deleting product: ${err}`);
			return fail(500, { message: 'Could not delete the product.' });
		}
	}
};