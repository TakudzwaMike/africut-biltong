import { ProductRepository } from '$lib/server/repositories/ProductRepository';
import { db } from '$lib/server/db';
import { product } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

const productRepo = new ProductRepository();

export const load = async ({ url }) => {
    const page = Number(url.searchParams.get('page')) || 1;
    const { products, totalItems, totalPages } = await productRepo.findMany({
        page,
        limit: 20,
        approvalStatus: 'pending'
    });

    return {
        products,
        pagination: { page, totalItems, totalPages }
    };
};

export const actions = {
    approve: async ({ request }) => {
        const data = await request.formData();
        const id = Number(data.get('id'));

        if (!id) return fail(400, { missing: true });

        await db.update(product).set({ approvalStatus: 'approved' }).where(eq(product.id, id));
        return { success: true };
    },
    reject: async ({ request }) => {
        const data = await request.formData();
        const id = Number(data.get('id'));

        if (!id) return fail(400, { missing: true });

        await db.update(product).set({ approvalStatus: 'rejected' }).where(eq(product.id, id));
        return { success: true };
    }
};
