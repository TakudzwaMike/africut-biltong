import { db } from '$lib/server/db';
import { userAddress } from '$lib/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { redirect, fail } from '@sveltejs/kit';

export async function load({ locals }) {
    if (!locals.user) throw redirect(303, '/login');

    const addresses = await db.select()
        .from(userAddress)
        .where(eq(userAddress.userId, locals.user.id))
        .orderBy(desc(userAddress.isDefault));

    return { addresses };
}

export const actions = {
    save: async ({ request, locals }) => {
        if (!locals.user) return fail(401);

        const formData = await request.formData();
        const id = formData.get('id');
        const isDefault = formData.get('isDefault') === 'on';
        
        const data = {
            label: String(formData.get('label')),
            firstName: String(formData.get('firstName')),
            lastName: String(formData.get('lastName')),
            address: String(formData.get('address')),
            city: String(formData.get('city')),
            state: String(formData.get('state')),
            zipCode: String(formData.get('zipCode')),
            country: String(formData.get('country')),
            isDefault: isDefault,
            userId: locals.user.id
        };

        try {
            // 1. If setting as default, unset others first
            if (isDefault) {
                await db.update(userAddress)
                    .set({ isDefault: false })
                    .where(eq(userAddress.userId, locals.user.id));
            }

            if (id) {
                // --- UPDATE ---
                await db.update(userAddress)
                    .set(data)
                    .where(and(
                        eq(userAddress.id, String(id)),
                        eq(userAddress.userId, locals.user.id)
                    ));
            } else {
                // --- CREATE ---
                await db.insert(userAddress).values(data);
            }

            return { success: true };

        } catch (error) {
            console.error('Address save error:', error);
            return fail(500, { message: 'Failed to save address' });
        }
    },

    delete: async ({ request, locals }) => {
        if (!locals.user) return fail(401);

        const formData = await request.formData();
        const id = String(formData.get('id'));

        try {
            await db.delete(userAddress)
                .where(and(
                    eq(userAddress.id, id),
                    eq(userAddress.userId, locals.user.id)
                ));
            return { success: true };
        } catch (error) {
            return fail(500, { message: 'Failed to delete address' });
        }
    }
};