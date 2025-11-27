import { db } from '$lib/server/db';
import { order, orderItem, product, userAddress } from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';
import { eq, inArray, and, sql, desc } from 'drizzle-orm';

// NEW: Add load function to fetch addresses
export async function load({ locals }) {
    if (!locals.user) {
        throw redirect(302, '/login?redirectTo=/checkout');
    }

    const addresses = await db.select()
        .from(userAddress)
        .where(eq(userAddress.userId, locals.user.id))
        .orderBy(desc(userAddress.isDefault));

    return { 
        user: locals.user,
        addresses 
    };
}