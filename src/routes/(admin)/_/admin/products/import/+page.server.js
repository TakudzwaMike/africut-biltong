import { fail } from '@sveltejs/kit';
import { parseCsv } from '$lib/server/csv';
import { log } from '$lib/server/auditLog';
import { ProductService } from '$lib/server/services/ProductService';

export const actions = {
    default: async ({ request, locals }) => {
        if (!locals.user || !['admin', 'store_manager'].includes(locals.user.role)) {
            return fail(403, { message: 'Unauthorized' });
        }

        const formData = await request.formData();
        const file = formData.get('csvFile');

        if (!file || file.size === 0) {
            return fail(400, { message: 'Please upload a valid CSV file.' });
        }

        try {
            const text = await file.text();
            const rows = parseCsv(text);

            // Skip header
            const dataRows = rows.slice(1).filter(r => r.length > 2);

            const productService = new ProductService();
            const stats = await productService.importProducts(locals.user.id, dataRows);

            await log(locals.user.id, 'import_products', { stats });

            return { success: true, message: `Import Complete: ${stats.created} Products Created, ${stats.updated} Variants Processed.` };

        } catch (error) {
            console.error('Import failed:', error);
            return fail(500, { message: `Import failed: ${error.message}` });
        }
    }
};
