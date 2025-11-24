import { db } from '$lib/server/db';
import { userTable } from '$lib/server/db/schema.js';
import { desc, eq, or, ilike, count, ne, and, inArray } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';

const ITEMS_PER_PAGE = 20;
const STAFF_ROLES = ['admin', 'store_manager', 'content_editor'];

export async function load({ url, locals }) {
    const query = url.searchParams.get('q');
    const view = url.searchParams.get('view') || 'all'; // 'all', 'staff', 'customer'
    const page = Number(url.searchParams.get('page')) || 1;
    const offset = (page - 1) * ITEMS_PER_PAGE;

    // Base condition: Exclude self
    const conditions = [ne(userTable.id, locals.user.id)];

    // 1. Apply View Filter
    if (view === 'staff') {
        conditions.push(inArray(userTable.role, STAFF_ROLES));
    } else if (view === 'customer') {
        conditions.push(eq(userTable.role, 'customer'));
    }

    // 2. Apply Search Filter
    if (query) {
        const searchStr = `%${query}%`;
        conditions.push(or(
            ilike(userTable.email, searchStr),
            ilike(userTable.firstName, searchStr),
            ilike(userTable.lastName, searchStr)
        ));
    }

    const whereClause = and(...conditions);

    const [users, totalResult] = await Promise.all([
        db.select().from(userTable)
            .where(whereClause)
            .orderBy(desc(userTable.createdAt))
            .limit(ITEMS_PER_PAGE)
            .offset(offset),
        db.select({ count: count() }).from(userTable).where(whereClause)
    ]);

    return { 
        users, 
        pagination: {
            page,
            totalPages: Math.ceil(totalResult[0].count / ITEMS_PER_PAGE),
            totalItems: totalResult[0].count,
            query,
            view
        }
    };
}

export const actions = {
    updateRole: async ({ request, locals }) => {
        const formData = await request.formData();
        const userId = String(formData.get('id'));
        const newRole = String(formData.get('role'));

        if (userId === locals.user.id) return fail(400, { message: 'Cannot change your own role.' });

        // Optional: Add check to prevent non-admins from promoting people
        if (locals.user.role !== 'admin') return fail(403, { message: 'Only Admins can change roles.' });

        try {
            await db.update(userTable)
                .set({ role: newRole })
                .where(eq(userTable.id, userId));

            await log(locals.user.id, 'update_user_role', {
                targetId: userId,
                data: { role: newRole }
            });

            return { success: true };
        } catch (e) {
            return fail(500, { message: 'Failed to update role' });
        }
    },

    delete: async ({ request, locals }) => {
        const formData = await request.formData();
        const userId = String(formData.get('id'));

        if (userId === locals.user.id) return fail(400, { message: 'Cannot delete yourself.' });
        if (locals.user.role !== 'admin') return fail(403, { message: 'Only Admins can delete users.' });

        try {
            await db.delete(userTable).where(eq(userTable.id, userId));
            
            await log(locals.user.id, 'delete_user', { targetId: userId });
            
            return { success: true };
        } catch (e) {
            return fail(500, { message: 'Failed to delete user' });
        }
    }
};