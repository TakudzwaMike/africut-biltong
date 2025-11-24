import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { product, productVariant, siteSettings } from '$lib/server/db/schema';
import { log } from '$lib/server/auditLog';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

// GET: List all products (Public or Admin)
export async function GET({ url }) {
    // Simple fetch for now. 
    // In a real app, you might want to support pagination params here 
    // if the frontend calls this directly instead of +page.server.js
	const products = await db.query.product.findMany({
        orderBy: desc(product.createdAt),
        with: {
            variants: true,
            featuredImage: true
        }
    });
	return json(products);
}

// Validation for creating a product
const createProductSchema = z.object({
    name: z.string().min(1, { message: 'Product name is required.' }),
    type: z.enum(['physical', 'digital', 'service']),
    shortDescription: z.string().optional(),
    tags: z.array(z.string()).optional(),
    sku: z.string().optional(),
    stock: z.number().int().optional().nullable(),
    priceUsd: z.coerce.number().positive().optional().nullable(),
    priceZar: z.coerce.number().positive().optional().nullable()
});

// POST: Create Product (Admin Only)
export async function POST({ request, locals }) {
	if (!locals.user || locals.user.role !== 'admin') {
		throw error(403, 'Forbidden');
	}

	const body = await request.json();
    const parseResult = createProductSchema.safeParse(body);

    if (!parseResult.success) {
        throw error(400, { message: 'Invalid input.', errors: parseResult.error.flatten().fieldErrors });
    }

    let { name, shortDescription, type, tags, priceUsd, priceZar, stock, sku } = parseResult.data;

    // Transaction to create Product + Default Variant
	const newProduct = await db.transaction(async (tx) => {
        // 1. Create Product
        const [createdProduct] = await tx.insert(product).values({
            name,
            shortDescription,
            type,
            tags,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000)
        }).returning();

        // 2. Auto-calculate Price if one is missing
        const [rateSetting] = await tx.select().from(siteSettings).where(eq(siteSettings.key, 'exchange_rate_usd_to_zar'));
        const exchangeRate = rateSetting ? parseFloat(rateSetting.value) : null;

        // Helper: Convert dollars to cents (integer)
        const toCents = (val) => val ? Math.round(val * 100) : null;

        if (exchangeRate) {
            if (priceUsd != null && priceZar == null) {
                priceZar = parseFloat((priceUsd * exchangeRate).toFixed(2));
            } else if (priceZar != null && priceUsd == null) {
                priceUsd = parseFloat((priceZar / exchangeRate).toFixed(2));
            }
        }

        // 3. Create Default Variant
        await tx.insert(productVariant).values({
            productId: createdProduct.id,
            name: 'Default',
            sku: sku || null,
            priceUsd: toCents(priceUsd), // Store as Cents
            priceZar: toCents(priceZar), // Store as Cents
            stock: stock,
            isDefault: true
        });
        
        return createdProduct;
    });

	await log(locals.user.id, 'create_product', {
		targetId: newProduct.id,
		data: { name: newProduct.name, type: newProduct.type }
	});

    // Return full object
    const fullProduct = await db.query.product.findFirst({
        where: eq(product.id, newProduct.id),
        with: { variants: true }
    });

	return json(fullProduct, { status: 201 });
}