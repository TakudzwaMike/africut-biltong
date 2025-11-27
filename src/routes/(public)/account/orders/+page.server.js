import { db } from '$lib/server/db';
import { order } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    if (!locals.user) throw redirect(303, '/login');

    const orders = await db.query.order.findMany({
        where: eq(order.userId, locals.user.id),
        orderBy: desc(order.createdAt),
        with: {
            items: {
                with: {
                    variant: {
                        with: { product: true }
                    }
                }
            }
        }
    });

    return { orders };
}
