import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { product as productTable, productVariant, productImage } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { log } from '$lib/server/auditLog';

// GET: Single Product
export async function GET({ params }) {
    const product = await db.query.product.findFirst({
        where: eq(productTable.id, Number(params.id)), // Note: ID is integer now based on your main schema
        with: {
            variants: true,
            images: { with: { media: true } }, // Fetch relation to Media
            featuredImage: true
        }
    });

    if (!product) {
        throw error(404, 'Product not found');
    }
	return json(product);
}

// PUT: Update Core Details
export async function PUT({ params, request, locals }) {
	if (!locals.user || locals.user.role !== 'admin') {
		throw error(403, 'Forbidden');
	}

    const id = Number(params.id);
	const body = await request.json();
    const { name, shortDescription, type, tags } = body;

	const [updatedProduct] = await db
		.update(productTable)
		.set({
            name,
            shortDescription,
            type,
            tags,
			updatedAt: new Date()
		})
		.where(eq(productTable.id, id))
		.returning();
	
    if (!updatedProduct) throw error(404, 'Product not found.');

	await log(locals.user.id, 'update_product', {
		targetId: updatedProduct.id,
		data: { ...body }
	});

	return json(updatedProduct);
}

// DELETE: Remove Product
export async function DELETE({ params, locals }) {
	if (!locals.user || locals.user.role !== 'admin') {
		throw error(403, 'Forbidden');
	}
    
    const id = Number(params.id);

	const [deletedProduct] = await db
		.delete(productTable)
		.where(eq(productTable.id, id))
		.returning();

    if (!deletedProduct) throw error(404, 'Product not found.');

    await log(locals.user.id, 'delete_product', {
		targetId: deletedProduct.id,
        data: { name: deletedProduct.name }
	});

	return json({ success: true, id: deletedProduct.id });
}