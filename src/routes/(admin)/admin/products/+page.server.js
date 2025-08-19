import { db } from '$lib/server/db';
import { product } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';

export async function load() {
	const products = await db.query.product.findMany({
		orderBy: desc(product.id)
	});
	return { products };
}

export const actions = {
	delete: async ({ url, locals }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Invalid request' });
		}

		try {
			// Fetch the product first to log its data before deletion
			const productToDelete = await db.query.product.findFirst({
				where: eq(product.id, Number(id))
			});

			if (!productToDelete) {
				return fail(404, { message: 'Product not found.' });
			}

			await db.delete(product).where(eq(product.id, Number(id)));

			await log(locals.user?.id, 'delete_product', {
				targetId: id,
				data: productToDelete // Log the data of the deleted product
			});

			return { status: 200, message: 'Product deleted successfully.' };
		} catch (error) {
			console.error(`Error deleting product: ${error}`);
			return fail(500, { message: 'Could not delete the product.' });
		}
	}
};